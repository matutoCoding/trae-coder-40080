import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Input, Picker, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { useReagentStore } from '@/store/useReagentStore'
import { validateRequired, validateQuantity, validateBatchNo, validateDateRange } from '@/utils/validator'
import { getExpiryDays, getExpiryStatus } from '@/utils/dateUtils'
import type { BatchInboundForm } from '@/types/reagent'
import styles from './index.module.scss'

const BatchInboundPage: React.FC = () => {
  const router = useRouter()
  const reagentIdParam = router.params.reagentId as string

  const { reagents, addBatch } = useReagentStore()

  const [selectedReagentId, setSelectedReagentId] = useState(reagentIdParam || '')
  const [formData, setFormData] = useState({
    batchNo: '',
    productionDate: dayjs().format('YYYY-MM-DD'),
    expiryDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    quantity: 10,
    storageLocation: '',
    operator: '',
    remarks: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const selectedReagent = useMemo(() =>
    reagents.find(r => r.id === selectedReagentId),
    [reagents, selectedReagentId]
  )

  const expiryPreview = useMemo(() => {
    if (!formData.expiryDate) return null
    const expiryDays = getExpiryDays(formData.expiryDate)
    const expiryStatus = getExpiryStatus(formData.expiryDate)
    return { expiryDays, expiryStatus }
  }, [formData.expiryDate])

  const updateFormField = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedReagentId) {
      newErrors.reagent = '请选择试剂'
    }

    const batchNoError = validateRequired(formData.batchNo, '批号')
    if (batchNoError) {
      newErrors.batchNo = batchNoError
    } else if (!validateBatchNo(formData.batchNo)) {
      newErrors.batchNo = '批号格式不正确，支持字母、数字、连字符和下划线，3-50位'
    }

    const dateError = validateDateRange(formData.productionDate, formData.expiryDate)
    if (dateError) {
      newErrors.expiryDate = dateError
    }

    const quantityError = validateQuantity(formData.quantity, '入库数量')
    if (quantityError) newErrors.quantity = quantityError

    const storageError = validateRequired(formData.storageLocation, '库位')
    if (storageError) newErrors.storageLocation = storageError

    const operatorError = validateRequired(formData.operator, '操作人')
    if (operatorError) newErrors.operator = operatorError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0]
      Taro.showToast({ title: firstError, icon: 'none' })
      return
    }

    if (expiryPreview && expiryPreview.expiryDays < 0) {
      Taro.showModal({
        title: '效期警告',
        content: '该批次已过期，是否确认入库？入库后将自动锁定。',
        success: async (res) => {
          if (res.confirm) {
            await doSubmit()
          }
        }
      })
      return
    }

    if (expiryPreview && expiryPreview.expiryDays <= 30) {
      Taro.showModal({
        title: '效期警告',
        content: `该批次将在${expiryPreview.expiryDays}天后过期，是否确认入库？`,
        success: async (res) => {
          if (res.confirm) {
            await doSubmit()
          }
        }
      })
      return
    }

    await doSubmit()
  }

  const doSubmit = async () => {
    setSubmitting(true)

    try {
      const inboundForm: BatchInboundForm = {
        reagentId: selectedReagentId,
        batchNo: formData.batchNo,
        productionDate: formData.productionDate,
        expiryDate: formData.expiryDate,
        quantity: formData.quantity,
        storageLocation: formData.storageLocation,
        operator: formData.operator,
        remarks: formData.remarks
      }

      const result = addBatch(inboundForm)

      if (result) {
        Taro.showToast({ title: '入库成功', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({ title: '入库失败，请重试', icon: 'none' })
      }
    } catch (error) {
      console.error('[BatchInbound] 入库失败:', error)
      Taro.showToast({ title: '系统错误，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const getExpiryStatusText = (): string => {
    if (!expiryPreview) return ''
    const { expiryDays, expiryStatus } = expiryPreview
    if (expiryDays < 0) return `已过期 ${-expiryDays} 天`
    if (expiryDays <= 7) return `${expiryDays} 天后到期（临期）`
    if (expiryDays <= 30) return `${expiryDays} 天后到期（预警）`
    return `${expiryDays} 天后到期`
  }

  const getExpiryStatusType = (): any => {
    if (!expiryPreview) return 'normal'
    return expiryPreview.expiryStatus
  }

  const minDate = dayjs().subtract(5, 'year').format('YYYY-MM-DD')
  const maxDate = dayjs().add(10, 'year').format('YYYY-MM-DD')

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.noticeCard}>
        <Text className={styles.noticeIcon}>📋</Text>
        <View className={styles.noticeContent}>
          <Text className={styles.noticeTitle}>入库须知</Text>
          <Text className={styles.noticeText}>1. 请准确填写批号、生产日期和有效期</Text>
          <Text className={styles.noticeText}>2. 系统将自动计算效期状态，过期批次将自动锁定</Text>
          <Text className={styles.noticeText}>3. 出库时将严格按照先进先出原则分配批次</Text>
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
            disabled={!!reagentIdParam}
          >
            <View className={classnames(
              styles.formPicker,
              errors.reagent && styles.inputError,
              reagentIdParam && styles.disabled
            )}>
              <Text className={styles.pickerValue}>
                {selectedReagent?.name || '请选择试剂'}
              </Text>
              {!reagentIdParam && <Text className={styles.pickerIcon}>›</Text>}
            </View>
          </Picker>
          {errors.reagent && (
            <Text className={styles.errorText}>{errors.reagent}</Text>
          )}
        </View>

        {selectedReagent && (
          <View className={styles.reagentInfo}>
            <View className={styles.reagentInfoRow}>
              <Text className={styles.reagentInfoLabel}>分类</Text>
              <Text className={styles.reagentInfoValue}>{selectedReagent.category}</Text>
            </View>
            <View className={styles.reagentInfoRow}>
              <Text className={styles.reagentInfoLabel}>规格</Text>
              <Text className={styles.reagentInfoValue}>{selectedReagent.specification}</Text>
            </View>
            <View className={styles.reagentInfoRow}>
              <Text className={styles.reagentInfoLabel}>当前库存</Text>
              <Text className={styles.reagentInfoValue}>
                {selectedReagent.availableStock} {selectedReagent.unit}
              </Text>
            </View>
            <View className={styles.reagentInfoRow}>
              <Text className={styles.reagentInfoLabel}>存储条件</Text>
              <Text className={styles.reagentInfoValue}>{selectedReagent.storageCondition}</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.formCard}>
        <Text className={styles.cardTitle}>批次信息</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            批号 <Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={classnames(styles.formInput, errors.batchNo && styles.inputError)}
            placeholder="请输入批号（如：20250601、BATCH-001）"
            value={formData.batchNo}
            onInput={(e) => updateFormField('batchNo', e.detail.value)}
            maxlength={50}
          />
          {errors.batchNo && (
            <Text className={styles.errorText}>{errors.batchNo}</Text>
          )}
        </View>

        <View className={styles.formRow}>
          <View className={styles.formGroupHalf}>
            <Text className={styles.formLabel}>
              生产日期 <Text className={styles.required}>*</Text>
            </Text>
            <Picker
              mode="date"
              value={formData.productionDate}
              start={minDate}
              end={maxDate}
              onChange={(e) => updateFormField('productionDate', e.detail.value)}
            >
              <View className={styles.formPicker}>
                <Text className={styles.pickerValue}>{formData.productionDate}</Text>
                <Text className={styles.pickerIcon}>›</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formGroupHalf}>
            <Text className={styles.formLabel}>
              有效期至 <Text className={styles.required}>*</Text>
            </Text>
            <Picker
              mode="date"
              value={formData.expiryDate}
              start={minDate}
              end={maxDate}
              onChange={(e) => updateFormField('expiryDate', e.detail.value)}
            >
              <View className={classnames(styles.formPicker, errors.expiryDate && styles.inputError)}>
                <Text className={styles.pickerValue}>{formData.expiryDate}</Text>
                <Text className={styles.pickerIcon}>›</Text>
              </View>
            </Picker>
            {errors.expiryDate && (
              <Text className={styles.errorText}>{errors.expiryDate}</Text>
            )}
          </View>
        </View>

        {expiryPreview && (
          <View className={classnames(
            styles.expiryPreview,
            expiryPreview.expiryDays <= 0 && styles.danger,
            expiryPreview.expiryDays > 0 && expiryPreview.expiryDays <= 30 && styles.warning
          )}>
            <View className={styles.expiryPreviewRow}>
              <Text className={styles.expiryPreviewLabel}>效期状态</Text>
              <StatusTag
                type={getExpiryStatusType()}
                text={getExpiryStatusText()}
                size="sm"
              />
            </View>
            {expiryPreview.expiryDays <= 30 && expiryPreview.expiryDays > 0 && (
              <Text className={styles.expiryWarning}>
                ⚠️ 该批次效期不足30天，入库后将被标记为临期
              </Text>
            )}
            {expiryPreview.expiryDays <= 0 && (
              <Text className={styles.expiryWarning}>
                🚨 该批次已过期，入库后将被自动锁定，无法出库
              </Text>
            )}
          </View>
        )}

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            入库数量 <Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.quantityPicker}>
            <View
              className={styles.quantityBtn}
              onClick={() => updateFormField('quantity', Math.max(1, formData.quantity - 1))}
            >
              <Text className={styles.quantityBtnText}>-</Text>
            </View>
            <Input
              className={classnames(styles.quantityInput, errors.quantity && styles.inputError)}
              type="number"
              value={String(formData.quantity)}
              onInput={(e) => updateFormField('quantity', parseInt(e.detail.value) || 0)}
            />
            <View
              className={styles.quantityBtn}
              onClick={() => updateFormField('quantity', formData.quantity + 1)}
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

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            存放库位 <Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={classnames(styles.formInput, errors.storageLocation && styles.inputError)}
            placeholder="请输入存放库位（如：A-01-03、冷藏柜2号）"
            value={formData.storageLocation}
            onInput={(e) => updateFormField('storageLocation', e.detail.value)}
          />
          {errors.storageLocation && (
            <Text className={styles.errorText}>{errors.storageLocation}</Text>
          )}
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            操作人 <Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={classnames(styles.formInput, errors.operator && styles.inputError)}
            placeholder="请输入操作人姓名"
            value={formData.operator}
            onInput={(e) => updateFormField('operator', e.detail.value)}
          />
          {errors.operator && (
            <Text className={styles.errorText}>{errors.operator}</Text>
          )}
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>备注</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入备注信息（选填）"
            value={formData.remarks}
            onInput={(e) => updateFormField('remarks', e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.bottomActionBar}>
        <View
          className={classnames(styles.submitButton, submitting && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text className={styles.submitText}>
            {submitting ? '提交中...' : '确认入库'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default BatchInboundPage
