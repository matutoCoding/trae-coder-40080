import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import BatchItem from '@/components/BatchItem'
import { useOutboundStore } from '@/store/useOutboundStore'
import { useReagentStore } from '@/store/useReagentStore'
import { useFIFO } from '@/hooks/useFIFO'
import { validateRequired, validatePhone, validateQuantity } from '@/utils/validator'
import type { OutboundFormData, FIFORecommendation } from '@/types/outbound'
import styles from './index.module.scss'

const OutboundConfirmPage: React.FC = () => {
  const router = useRouter()
  const reagentIdParam = router.params.reagentId as string
  const outboundIdParam = router.params.id as string

  const { createOutbound, getOutboundById } = useOutboundStore()
  const { reagents, checkExpiredBatches } = useReagentStore()

  const [selectedReagentId, setSelectedReagentId] = useState(reagentIdParam || '')
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({
    researchGroup: '',
    receiver: '',
    receiverPhone: '',
    purpose: '',
    remarks: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkExpiredBatches()
  }, [])

  useEffect(() => {
    if (outboundIdParam) {
      const outbound = getOutboundById(outboundIdParam)
      if (outbound) {
        setFormData({
          researchGroup: outbound.researchGroup,
          receiver: outbound.receiver,
          receiverPhone: outbound.receiverPhone,
          purpose: outbound.purpose,
          remarks: outbound.remarks || ''
        })
      }
    }
  }, [outboundIdParam])

  const { recommendation, error: fifoError } = useFIFO(selectedReagentId, quantity)

  const selectedReagent = useMemo(() =>
    reagents.find(r => r.id === selectedReagentId),
    [reagents, selectedReagentId]
  )

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedReagentId) {
      newErrors.reagent = '请选择出库试剂'
    }

    const quantityError = validateQuantity(quantity, '出库数量')
    if (quantityError) newErrors.quantity = quantityError

    if (selectedReagent && quantity > selectedReagent.availableStock) {
      newErrors.quantity = `出库数量不能超过库存(${selectedReagent.availableStock}${selectedReagent.unit})`
    }

    if (!recommendation?.isSufficient) {
      newErrors.quantity = '库存不足，无法满足出库需求'
    }

    const researchGroupError = validateRequired(formData.researchGroup, '领用课题组')
    if (researchGroupError) newErrors.researchGroup = researchGroupError

    const receiverError = validateRequired(formData.receiver, '领用人')
    if (receiverError) newErrors.receiver = receiverError

    const phoneError = validatePhone(formData.receiverPhone)
    if (phoneError) newErrors.receiverPhone = phoneError

    const purposeError = validateRequired(formData.purpose, '用途')
    if (purposeError) newErrors.purpose = purposeError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0]
      Taro.showToast({ title: firstError, icon: 'none' })
      return
    }

    if (fifoError) {
      Taro.showToast({ title: fifoError, icon: 'none' })
      return
    }

    setSubmitting(true)

    try {
      const outboundData: OutboundFormData = {
        researchGroup: formData.researchGroup,
        receiver: formData.receiver,
        receiverPhone: formData.receiverPhone,
        purpose: formData.purpose,
        items: [{
          reagentId: selectedReagentId,
          reagentName: selectedReagent?.name || '',
          quantity,
          unit: selectedReagent?.unit || ''
        }],
        remarks: formData.remarks
      }

      const result = createOutbound(outboundData)

      if (result) {
        Taro.showToast({ title: '出库成功', icon: 'success' })
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/outbound/index' })
        }, 1500)
      } else {
        Taro.showToast({ title: '出库失败，请重试', icon: 'none' })
      }
    } catch (error) {
      console.error('[OutboundConfirm] 出库失败:', error)
      Taro.showToast({ title: '系统错误，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const getExpiryStatusType = (expiryDays: number): any => {
    if (expiryDays < 0) return 'expired'
    if (expiryDays <= 7) return 'expiring_7'
    if (expiryDays <= 15) return 'expiring_15'
    if (expiryDays <= 30) return 'expiring_30'
    return 'normal'
  }

  const isViewMode = !!outboundIdParam
  const viewOutbound = outboundIdParam ? getOutboundById(outboundIdParam) : null

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      {isViewMode && viewOutbound ? (
        <View className={styles.viewModeContainer}>
          <View className={styles.outboundHeader}>
            <View className={styles.outboundNoRow}>
              <Text className={styles.outboundNo}>{viewOutbound.outboundNo}</Text>
              <StatusTag type={viewOutbound.status as any} text="已完成" size="sm" />
            </View>
            <Text className={styles.outboundTime}>
              {dayjs(viewOutbound.outboundTime).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </View>

          <View className={styles.infoCard}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>领用课题组</Text>
              <Text className={styles.infoValue}>{viewOutbound.researchGroup}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>领用人</Text>
              <Text className={styles.infoValue}>{viewOutbound.receiver}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系电话</Text>
              <Text className={styles.infoValue}>{viewOutbound.receiverPhone}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>用途</Text>
              <Text className={styles.infoValue}>{viewOutbound.purpose}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>操作人</Text>
              <Text className={styles.infoValue}>{viewOutbound.operator}</Text>
            </View>
          </View>

          <View className={styles.sectionCard}>
            <Text className={styles.cardTitle}>
              出库明细 ({viewOutbound.totalItems}项 · {viewOutbound.totalQuantity}份)
            </Text>
            {viewOutbound.items.map(item => (
              <View key={item.id} className={styles.outboundItem}>
                <View className={styles.itemHeader}>
                  <Text className={styles.itemName}>{item.reagentName}</Text>
                  <Text className={styles.itemQty}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemBatch}>批次：{item.batchNo}</Text>
                  <Text className={styles.itemExpiry}>效期：{item.expiryDate}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <>
          <View className={styles.fifoBanner}>
            <Text className={styles.bannerIcon}>📋</Text>
            <View className={styles.bannerContent}>
              <Text className={styles.bannerTitle}>先进先出 (FIFO)</Text>
              <Text className={styles.bannerDesc}>系统自动按效期先后推荐出库批次</Text>
            </View>
          </View>

          <View className={styles.formCard}>
            <Text className={styles.cardTitle}>选择试剂</Text>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                试剂名称 <Text className={styles.required}>*</Text>
              </Text>
              <Picker
                mode="selector"
                range={reagents.map(r => r.name)}
                value={reagents.findIndex(r => r.id === selectedReagentId)}
                onChange={(e) => {
                  const idx = parseInt(e.detail.value)
                  setSelectedReagentId(reagents[idx]?.id || '')
                }}
              >
                <View className={classnames(styles.formPicker, errors.reagent && styles.inputError)}>
                  <Text className={styles.pickerValue}>
                    {selectedReagent?.name || '请选择试剂'}
                  </Text>
                  <Text className={styles.pickerIcon}>›</Text>
                </View>
              </Picker>
              {errors.reagent && (
                <Text className={styles.errorText}>{errors.reagent}</Text>
              )}
            </View>

            {selectedReagent && (
              <View className={styles.reagentInfo}>
                <View className={styles.reagentInfoRow}>
                  <Text className={styles.reagentInfoLabel}>规格</Text>
                  <Text className={styles.reagentInfoValue}>{selectedReagent.specification}</Text>
                </View>
                <View className={styles.reagentInfoRow}>
                  <Text className={styles.reagentInfoLabel}>可用库存</Text>
                  <Text className={classnames(
                    styles.reagentInfoValue,
                    selectedReagent.availableStock < 10 && styles.danger
                  )}>
                    {selectedReagent.availableStock} {selectedReagent.unit}
                  </Text>
                </View>
                <View className={styles.reagentInfoRow}>
                  <Text className={styles.reagentInfoLabel}>存储条件</Text>
                  <Text className={styles.reagentInfoValue}>{selectedReagent.storageCondition}</Text>
                </View>
              </View>
            )}

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                出库数量 <Text className={styles.required}>*</Text>
              </Text>
              <View className={styles.quantityPicker}>
                <View
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text className={styles.quantityBtnText}>-</Text>
                </View>
                <Input
                  className={classnames(styles.quantityInput, errors.quantity && styles.inputError)}
                  type="number"
                  value={String(quantity)}
                  onInput={(e) => setQuantity(parseInt(e.detail.value) || 0)}
                />
                <View
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Text className={styles.quantityBtnText}>+</Text>
                </View>
                <Text className={styles.quantityUnit}>
                  {selectedReagent?.unit || '份'}
                </Text>
              </View>
              {errors.quantity && (
                <Text className={styles.errorText}>{errors.quantity}</Text>
              )}
            </View>
          </View>

          {recommendation && recommendation.batches.length > 0 && (
            <View className={styles.sectionCard}>
              <View className={styles.sectionHeader}>
                <Text className={styles.cardTitle}>FIFO 出库推荐</Text>
                {!recommendation.isSufficient && (
                  <StatusTag type="expired" text="库存不足" size="sm" />
                )}
              </View>

              <View className={styles.recommendationSummary}>
                <Text className={styles.summaryText}>
                  需求 <Text className={styles.highlight}>{recommendation.requestedQuantity}</Text> {selectedReagent?.unit}，
                  可用 <Text className={classnames(recommendation.isSufficient ? styles.success : styles.danger)}>
                    {recommendation.availableQuantity}
                  </Text> {selectedReagent?.unit}
                </Text>
              </View>

              <View className={styles.batchAllocation}>
                <Text className={styles.allocationTitle}>批次分配方案</Text>
                {recommendation.batches.map((batch, index) => (
                  <View key={batch.batchId} className={styles.allocationItem}>
                    <View className={styles.allocationIndex}>{index + 1}</View>
                    <View className={styles.allocationContent}>
                      <View className={styles.allocationHeader}>
                        <Text className={styles.batchNo}>批次 {batch.batchNo}</Text>
                        <StatusTag
                          type={getExpiryStatusType(batch.expiryDays)}
                          text={batch.expiryDays < 0 ? '已过期' : `${batch.expiryDays}天到期`}
                          size="sm"
                        />
                      </View>
                      <View className={styles.allocationInfo}>
                        <Text className={styles.infoText}>效期：{batch.expiryDate}</Text>
                        <Text className={styles.infoText}>
                          分配：{batch.allocatedQuantity} / 可用：{batch.availableQuantity} {selectedReagent?.unit}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {recommendation.isSufficient && (
                <View className={styles.fifoCompliance}>
                  <Text className={styles.complianceIcon}>✓</Text>
                  <Text className={styles.complianceText}>
                    符合先进先出原则，将按效期由近到远依次出库
                  </Text>
                </View>
              )}
            </View>
          )}

          <View className={styles.formCard}>
            <Text className={styles.cardTitle}>领用信息</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                领用课题组 <Text className={styles.required}>*</Text>
              </Text>
              <Input
                className={classnames(styles.formInput, errors.researchGroup && styles.inputError)}
                placeholder="请输入领用课题组"
                value={formData.researchGroup}
                onInput={(e) => updateFormField('researchGroup', e.detail.value)}
              />
              {errors.researchGroup && (
                <Text className={styles.errorText}>{errors.researchGroup}</Text>
              )}
            </View>

            <View className={styles.formRow}>
              <View className={styles.formGroupHalf}>
                <Text className={styles.formLabel}>
                  领用人 <Text className={styles.required}>*</Text>
                </Text>
                <Input
                  className={classnames(styles.formInput, errors.receiver && styles.inputError)}
                  placeholder="姓名"
                  value={formData.receiver}
                  onInput={(e) => updateFormField('receiver', e.detail.value)}
                />
                {errors.receiver && (
                  <Text className={styles.errorText}>{errors.receiver}</Text>
                )}
              </View>

              <View className={styles.formGroupHalf}>
                <Text className={styles.formLabel}>
                  联系电话 <Text className={styles.required}>*</Text>
                </Text>
                <Input
                  className={classnames(styles.formInput, errors.receiverPhone && styles.inputError)}
                  placeholder="手机号"
                  type="number"
                  maxLength={11}
                  value={formData.receiverPhone}
                  onInput={(e) => updateFormField('receiverPhone', e.detail.value)}
                />
                {errors.receiverPhone && (
                  <Text className={styles.errorText}>{errors.receiverPhone}</Text>
                )}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                用途 <Text className={styles.required}>*</Text>
              </Text>
              <Input
                className={classnames(styles.formInput, errors.purpose && styles.inputError)}
                placeholder="请输入出库用途"
                value={formData.purpose}
                onInput={(e) => updateFormField('purpose', e.detail.value)}
              />
              {errors.purpose && (
                <Text className={styles.errorText}>{errors.purpose}</Text>
              )}
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>备注</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入备注信息（选填）"
                value={formData.remarks}
                onInput={(e) => updateFormField('remarks', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.bottomActionBar}>
            <View
              className={classnames(
                styles.submitButton,
                (!recommendation?.isSufficient || submitting) && styles.disabled
              )}
              onClick={handleSubmit}
            >
              <Text className={styles.submitText}>
                {submitting ? '提交中...' : !recommendation?.isSufficient ? '库存不足' : '确认出库'}
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  )
}

export default OutboundConfirmPage
