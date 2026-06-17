import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { useReagentExpiryStatus } from '@/hooks/useExpiryAlert'
import type { Reagent } from '@/types/reagent'
import styles from './index.module.scss'

interface ReagentCardProps {
  reagent: Reagent
  onClick?: () => void
}

const ReagentCard: React.FC<ReagentCardProps> = ({ reagent, onClick }) => {
  const { status: expiryStatus, message } = useReagentExpiryStatus(reagent.id)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/reagent-detail/index?id=${reagent.id}`
      })
    }
  }

  return (
    <View className={styles.reagentCard} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{reagent.name}</Text>
          {expiryStatus === 'expired' && (
            <StatusTag type="expired" text="有过期" size="sm" />
          )}
          {expiryStatus === 'expiring' && (
            <StatusTag type="expiring_7" text="临期" size="sm" />
          )}
        </View>
        <View className={styles.categoryTag}>
          <Text className={styles.categoryText}>{reagent.category}</Text>
        </View>
      </View>

      <View className={styles.specRow}>
        <Text className={styles.specText}>{reagent.specification}</Text>
        <Text className={styles.mfgText}>{reagent.manufacturer}</Text>
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>库存</Text>
          <Text className={classnames(styles.infoValue, styles.stockValue)}>
            {reagent.availableStock}
            <Text className={styles.unit}>{reagent.unit}</Text>
          </Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>存储</Text>
          <Text className={styles.infoValue}>{reagent.storageCondition}</Text>
        </View>
      </View>

      {(reagent.expiringCount > 0 || reagent.expiredCount > 0) && (
        <View className={styles.alertRow}>
          {reagent.expiringCount > 0 && (
            <View className={classnames(styles.alertItem, styles.warning)}>
              <Text className={styles.alertIcon}>⚠</Text>
              <Text className={styles.alertText}>临期{reagent.expiringCount}{reagent.unit}</Text>
            </View>
          )}
          {reagent.expiredCount > 0 && (
            <View className={classnames(styles.alertItem, styles.error)}>
              <Text className={styles.alertIcon}>✕</Text>
              <Text className={styles.alertText}>过期{reagent.expiredCount}{reagent.unit}</Text>
            </View>
          )}
        </View>
      )}

      {message && (
        <View className={styles.alertMessage}>
          <Text className={styles.alertMessageText}>{message}</Text>
        </View>
      )}
    </View>
  )
}

export default ReagentCard
