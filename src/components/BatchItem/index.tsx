import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { getExpiryStatusText } from '@/utils/dateUtils'
import type { ReagentBatch } from '@/types/reagent'
import styles from './index.module.scss'

interface BatchItemProps {
  batch: ReagentBatch
  showReagentName?: boolean
  onClick?: () => void
  selectable?: boolean
  selected?: boolean
  disabled?: boolean
}

const BatchItem: React.FC<BatchItemProps> = ({ 
  batch, 
  showReagentName = false, 
  onClick,
  selectable = false,
  selected = false,
  disabled = false
}) => {
  const isLocked = batch.status === 'locked' || batch.status === 'depleted'

  const getStatusType = (): any => {
    if (batch.status === 'locked') return 'locked'
    if (batch.status === 'depleted') return 'depleted'
    return batch.expiryStatus
  }

  const getStatusText = (): string => {
    if (batch.status === 'locked') return '已锁定'
    if (batch.status === 'depleted') return '已耗尽'
    return getExpiryStatusText(batch.expiryStatus)
  }

  return (
    <View 
      className={classnames(
        styles.batchItem, 
        isLocked && styles.locked,
        selected && styles.selected,
        disabled && styles.disabled,
        (onClick || selectable) && styles.clickable
      )}
      onClick={() => !disabled && onClick?.()}
    >
      {selectable && (
        <View className={classnames(styles.checkbox, selected && styles.checked)}>
          {selected && <Text className={styles.checkIcon}>✓</Text>}
        </View>
      )}

      <View className={styles.content}>
        <View className={styles.header}>
          <View className={styles.batchNoRow}>
            {showReagentName && (
              <Text className={styles.reagentName}>{batch.reagentName}</Text>
            )}
            <Text className={styles.batchNo}>批次: {batch.batchNo}</Text>
          </View>
          <StatusTag type={getStatusType()} text={getStatusText()} size="sm" />
        </View>

        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>生产日期</Text>
            <Text className={styles.infoValue}>{batch.productionDate}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>有效期至</Text>
            <Text className={classnames(
              styles.infoValue,
              batch.expiryDays <= 7 && styles.critical,
              batch.expiryDays <= 30 && batch.expiryDays > 7 && styles.warning
            )}>
              {batch.expiryDate}
              {batch.expiryDays >= 0 && (
                <Text className={styles.daysLeft}>（{batch.expiryDays}天后到期）</Text>
              )}
              {batch.expiryDays < 0 && (
                <Text className={styles.daysExpired}>（已过期{-batch.expiryDays}天）</Text>
              )}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>库存</Text>
            <Text className={styles.infoValue}>
              {batch.availableQuantity}/{batch.quantity} {batch.unit}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>库位</Text>
            <Text className={styles.infoValue}>{batch.storageLocation}</Text>
          </View>
        </View>

        {batch.remarks && (
          <View className={styles.remarks}>
            <Text className={styles.remarksText}>{batch.remarks}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default BatchItem
