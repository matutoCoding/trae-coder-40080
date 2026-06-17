import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import type { Cage } from '@/types/cage'
import styles from './index.module.scss'

interface CageCardProps {
  cage: Cage
  onClick?: () => void
}

const statusMap: Record<Cage['status'], { text: string; type: any }> = {
  available: { text: '可预约', type: 'available' },
  booked: { text: '已预约', type: 'booked' },
  maintenance: { text: '维护中', type: 'maintenance' },
  cleaning: { text: '清洁中', type: 'cleaning' }
}

const CageCard: React.FC<CageCardProps> = ({ cage, onClick }) => {
  const status = statusMap[cage.status]

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/cage-detail/index?id=${cage.id}`
      })
    }
  }

  return (
    <View className={styles.cageCard} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.cageNoRow}>
          <Text className={styles.cageNo}>{cage.cageNo}</Text>
          <StatusTag type={status.type} text={status.text} size="sm" />
        </View>
        <Text className={styles.cageType}>{cage.type}</Text>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>位置</Text>
          <Text className={styles.infoValue}>{cage.location}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>规格</Text>
          <Text className={styles.infoValue}>{cage.capacity}只/笼</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>当前</Text>
          <Text className={classnames(styles.infoValue, cage.currentAnimals > 0 && styles.occupied)}>
            {cage.currentAnimals}只
          </Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>类型</Text>
          <Text className={styles.infoValue}>{cage.specification}</Text>
        </View>
      </View>

      {cage.remarks && (
        <View className={styles.remarks}>
          <Text className={styles.remarksText}>{cage.remarks}</Text>
        </View>
      )}

      {cage.equipment && cage.equipment.length > 0 && (
        <View className={styles.equipmentRow}>
          {cage.equipment.map((item, index) => (
            <View key={index} className={styles.equipmentTag}>
              <Text className={styles.equipmentText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default CageCard
