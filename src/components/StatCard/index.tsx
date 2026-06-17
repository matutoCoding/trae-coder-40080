import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatCardProps {
  title: string
  value: number | string
  unit?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  trend?: 'up' | 'down'
  trendValue?: string
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  unit, 
  color = 'primary',
  trend,
  trendValue,
  onClick 
}) => {
  return (
    <View 
      className={classnames(styles.statCard, styles[color], onClick && styles.clickable)}
      onClick={onClick}
    >
      <Text className={styles.title}>{title}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend && trendValue && (
        <View className={classnames(styles.trend, styles[trend])}>
          <Text className={styles.trendIcon}>{trend === 'up' ? '↑' : '↓'}</Text>
          <Text className={styles.trendText}>{trendValue}</Text>
        </View>
      )}
    </View>
  )
}

export default StatCard
