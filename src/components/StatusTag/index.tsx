import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatusTagProps {
  type: 'available' | 'booked' | 'maintenance' | 'cleaning' | 
        'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' |
        'normal' | 'expiring_7' | 'expiring_15' | 'expiring_30' | 'expired' | 'locked' | 'depleted'
  text: string
  size?: 'sm' | 'md'
}

const StatusTag: React.FC<StatusTagProps> = ({ type, text, size = 'md' }) => {
  return (
    <View className={classnames(styles.statusTag, styles[type], styles[size])}>
      <Text className={styles.tagText}>{text}</Text>
    </View>
  )
}

export default StatusTag
