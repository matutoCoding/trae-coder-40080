import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { useConflictCheck } from '@/hooks/useConflictCheck'
import { useBookingStore } from '@/store/useBookingStore'
import { useCageStore } from '@/store/useCageStore'
import { validateRequired, validatePhone, validateQuantity } from '@/utils/validator'
import type { BookingFormData } from '@/types/booking'
import styles from './index.module.scss'

const animalTypeOptions = ['小鼠', '大鼠', '豚鼠', '兔子', '其他']

const BookingConfirmPage: React.FC = () => {
  const router = useRouter()
  const { createBooking } = useBookingStore()
  const { getCageById } = useCageStore()

  const cageId = router.params.cageId as string
  const cageNo = router.params.cageNo as string
  const startDateParam = router.params.startDate as string
  const endDateParam = router.params.endDate as string
  const startTimeParam = router.params.startTime as string
  const endTimeParam = router.params.endTime as string

  const [formData, setFormData] = useState({
    researchGroup: '',
    projectName: '',
    researcher: '',
    phone: '',
    animalType: '小鼠',
    animalCount: 5,
    purpose: '',
    remarks: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const cage = useMemo(() => getCageById(cageId), [cageId])

  const { hasConflict, conflictMessage, conflictingBookings } = useConflictCheck(
    cageId,
    startDateParam,
    endDateParam,
    startTimeParam,
    endTimeParam
  )

  const updateFormField = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const researchGroupError = validateRequired(formData.researchGroup, '课题组名称')
    if (researchGroupError) newErrors.researchGroup = researchGroupError

    const projectNameError = validateRequired(formData.projectName, '项目名称')
    if (projectNameError) newErrors.projectName = projectNameError

    const researcherError = validateRequired(formData.researcher, '负责人姓名')
    if (researcherError) newErrors.researcher = researcherError

    const phoneError = validatePhone(formData.phone)
    if (phoneError) newErrors.phone = phoneError

    const animalCountError = validateQuantity(formData.animalCount, '动物数量')
    if (animalCountError) newErrors.animalCount = animalCountError

    if (cage && formData.animalCount > cage.capacity) {
      newErrors.animalCount = `动物数量不能超过笼位容量(${cage.capacity}只)`
    }

    const purposeError = validateRequired(formData.purpose, '实验用途')
    if (purposeError) newErrors.purpose = purposeError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (hasConflict) {
      Taro.showToast({ title: '所选时段存在冲突，请重新选择', icon: 'none' })
      return
    }

    if (!validateForm()) {
      const firstError = Object.values(errors)[0]
      Taro.showToast({ title: firstError, icon: 'none' })
      return
    }

    setSubmitting(true)

    try {
      const bookingData: BookingFormData = {
        cageId,
        researchGroup: formData.researchGroup,
        projectName: formData.projectName,
        researcher: formData.researcher,
        phone: formData.phone,
        animalType: formData.animalType,
        animalCount: formData.animalCount,
        startDate: startDateParam,
        endDate: endDateParam,
        startTime: startTimeParam,
        endTime: endTimeParam,
        purpose: formData.purpose,
        remarks: formData.remarks
      }

      const result = createBooking(bookingData)

      if (result) {
        Taro.showToast({ title: '预约提交成功', icon: 'success' })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/my-booking/index' })
        }, 1500)
      } else {
        Taro.showToast({ title: '预约提交失败，请重试', icon: 'none' })
      }
    } catch (error) {
      console.error('[BookingConfirm] 提交失败:', error)
      Taro.showToast({ title: '系统错误，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const dateDays = useMemo(() => {
    if (startDateParam && endDateParam) {
      const start = dayjs(startDateParam)
      const end = dayjs(endDateParam)
      return end.diff(start, 'day') + 1
    }
    return 1
  }, [startDateParam, endDateParam])

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.summaryCard}>
        <Text className={styles.cardTitle}>预约信息</Text>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>笼位</Text>
          <Text className={styles.summaryValue}>{cageNo}</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>日期范围</Text>
          <Text className={styles.summaryValue}>
            {startDateParam} 至 {endDateParam}
          </Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>时段</Text>
          <Text className={styles.summaryValue}>
            {startTimeParam} - {endTimeParam}
          </Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>天数</Text>
          <Text className={styles.summaryValueHighlight}>{dateDays} 天</Text>
        </View>
        {cage && (
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>笼位容量</Text>
            <Text className={styles.summaryValue}>{cage.capacity} 只</Text>
          </View>
        )}
      </View>

      {hasConflict && (
        <View className={styles.conflictAlert}>
          <Text className={styles.conflictIcon}>⚠️</Text>
          <View className={styles.conflictContent}>
            <Text className={styles.conflictTitle}>时段冲突</Text>
            <Text className={styles.conflictText}>{conflictMessage}</Text>
            {conflictingBookings.map((booking, index) => (
              <View key={index} className={styles.conflictBooking}>
                <Text className={styles.conflictBookingText}>
                  {booking.researchGroup} · {booking.projectName}
                </Text>
                <Text className={styles.conflictBookingTime}>
                  {booking.startDate} {booking.startTime}-{booking.endTime}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.formCard}>
        <Text className={styles.cardTitle}>填写预约信息</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            课题组名称 <Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={classnames(styles.formInput, errors.researchGroup && styles.inputError)}
            placeholder="请输入课题组名称"
            value={formData.researchGroup}
            onInput={(e) => updateFormField('researchGroup', e.detail.value)}
          />
          {errors.researchGroup && (
            <Text className={styles.errorText}>{errors.researchGroup}</Text>
          )}
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            项目名称 <Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={classnames(styles.formInput, errors.projectName && styles.inputError)}
            placeholder="请输入项目名称"
            value={formData.projectName}
            onInput={(e) => updateFormField('projectName', e.detail.value)}
          />
          {errors.projectName && (
            <Text className={styles.errorText}>{errors.projectName}</Text>
          )}
        </View>

        <View className={styles.formRow}>
          <View className={styles.formGroupHalf}>
            <Text className={styles.formLabel}>
              负责人 <Text className={styles.required}>*</Text>
            </Text>
            <Input
              className={classnames(styles.formInput, errors.researcher && styles.inputError)}
              placeholder="姓名"
              value={formData.researcher}
              onInput={(e) => updateFormField('researcher', e.detail.value)}
            />
            {errors.researcher && (
              <Text className={styles.errorText}>{errors.researcher}</Text>
            )}
          </View>

          <View className={styles.formGroupHalf}>
            <Text className={styles.formLabel}>
              联系电话 <Text className={styles.required}>*</Text>
            </Text>
            <Input
              className={classnames(styles.formInput, errors.phone && styles.inputError)}
              placeholder="手机号"
              type="number"
              maxLength={11}
              value={formData.phone}
              onInput={(e) => updateFormField('phone', e.detail.value)}
            />
            {errors.phone && (
              <Text className={styles.errorText}>{errors.phone}</Text>
            )}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            动物类型
          </Text>
          <View className={styles.animalTypeOptions}>
            {animalTypeOptions.map(type => (
              <View
                key={type}
                className={classnames(
                  styles.animalTypeChip,
                  formData.animalType === type && styles.active
                )}
                onClick={() => updateFormField('animalType', type)}
              >
                <Text className={styles.animalTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            动物数量 <Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.quantityPicker}>
            <View
              className={styles.quantityBtn}
              onClick={() => updateFormField('animalCount', Math.max(1, formData.animalCount - 1))}
            >
              <Text className={styles.quantityBtnText}>-</Text>
            </View>
            <Input
              className={classnames(styles.quantityInput, errors.animalCount && styles.inputError)}
              type="number"
              value={String(formData.animalCount)}
              onInput={(e) => updateFormField('animalCount', parseInt(e.detail.value) || 0)}
            />
            <View
              className={styles.quantityBtn}
              onClick={() => updateFormField('animalCount', Math.min(cage?.capacity || 99, formData.animalCount + 1))}
            >
              <Text className={styles.quantityBtnText}>+</Text>
            </View>
            <Text className={styles.quantityUnit}>只</Text>
            {cage && (
              <Text className={styles.quantityMax}>（最大 {cage.capacity} 只）</Text>
            )}
          </View>
          {errors.animalCount && (
            <Text className={styles.errorText}>{errors.animalCount}</Text>
          )}
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            实验用途 <Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={classnames(styles.formInput, errors.purpose && styles.inputError)}
            placeholder="请输入实验用途"
            value={formData.purpose}
            onInput={(e) => updateFormField('purpose', e.detail.value)}
          />
          {errors.purpose && (
            <Text className={styles.errorText}>{errors.purpose}</Text>
          )}
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>备注说明</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入备注信息（选填）"
            value={formData.remarks}
            onInput={(e) => updateFormField('remarks', e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.noticeCard}>
        <Text className={styles.noticeIcon}>📋</Text>
        <View className={styles.noticeContent}>
          <Text className={styles.noticeTitle}>预约须知</Text>
          <Text className={styles.noticeText}>1. 预约提交后需等待管理员审核确认</Text>
          <Text className={styles.noticeText}>2. 如需取消预约，请提前24小时操作</Text>
          <Text className={styles.noticeText}>3. 笼位使用期间请保持清洁卫生</Text>
          <Text className={styles.noticeText}>4. 动物实验需遵守相关伦理规范</Text>
        </View>
      </View>

      <View className={styles.bottomActionBar}>
        <View
          className={classnames(
            styles.submitButton,
            (hasConflict || submitting) && styles.disabled
          )}
          onClick={handleSubmit}
        >
          <Text className={styles.submitText}>
            {submitting ? '提交中...' : hasConflict ? '时段冲突' : '提交预约'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default BookingConfirmPage
