import type { Cage } from '@/types/cage'

export const cageList: Cage[] = [
  {
    id: 'cage-001',
    cageNo: 'A-101',
    type: '小鼠笼',
    location: 'A区1楼',
    floor: '1楼',
    room: 'A101室',
    capacity: 10,
    currentAnimals: 0,
    status: 'available',
    specification: 'IVC独立通风笼',
    equipment: ['独立通风系统', '自动饮水系统'],
    remarks: 'SPF级小鼠专用',
    createTime: '2025-01-01 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-002',
    cageNo: 'A-102',
    type: '小鼠笼',
    location: 'A区1楼',
    floor: '1楼',
    room: 'A101室',
    capacity: 10,
    currentAnimals: 6,
    status: 'booked',
    specification: 'IVC独立通风笼',
    equipment: ['独立通风系统', '自动饮水系统'],
    createTime: '2025-01-01 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-003',
    cageNo: 'A-103',
    type: '大鼠笼',
    location: 'A区1楼',
    floor: '1楼',
    room: 'A102室',
    capacity: 5,
    currentAnimals: 0,
    status: 'available',
    specification: '普通大鼠笼',
    equipment: ['饮水瓶', '饲料盒'],
    createTime: '2025-01-02 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-004',
    cageNo: 'A-201',
    type: '兔笼',
    location: 'A区2楼',
    floor: '2楼',
    room: 'A201室',
    capacity: 2,
    currentAnimals: 1,
    status: 'booked',
    specification: '不锈钢兔笼',
    equipment: ['自动饮水系统', '粪尿收集盘'],
    createTime: '2025-01-03 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-005',
    cageNo: 'B-101',
    type: '豚鼠笼',
    location: 'B区1楼',
    floor: '1楼',
    room: 'B101室',
    capacity: 8,
    currentAnimals: 0,
    status: 'available',
    specification: '塑料底网豚鼠笼',
    equipment: ['饮水瓶', '饲料盒', '垫料'],
    createTime: '2025-01-04 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-006',
    cageNo: 'B-102',
    type: '小鼠笼',
    location: 'B区1楼',
    floor: '1楼',
    room: 'B102室',
    capacity: 10,
    currentAnimals: 0,
    status: 'maintenance',
    specification: 'IVC独立通风笼',
    equipment: ['独立通风系统', '自动饮水系统'],
    remarks: '设备维护中，预计6月20日恢复使用',
    createTime: '2025-01-05 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-007',
    cageNo: 'B-201',
    type: '大鼠笼',
    location: 'B区2楼',
    floor: '2楼',
    room: 'B201室',
    capacity: 5,
    currentAnimals: 0,
    status: 'cleaning',
    specification: '代谢笼',
    equipment: ['代谢收集系统', '自动饮水系统'],
    remarks: '清洁消毒中',
    createTime: '2025-01-06 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-008',
    cageNo: 'C-101',
    type: '小鼠笼',
    location: 'C区1楼',
    floor: '1楼',
    room: 'C101室',
    capacity: 10,
    currentAnimals: 0,
    status: 'available',
    specification: '隔离笼',
    equipment: ['空气过滤系统', '独立通风系统'],
    createTime: '2025-01-07 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-009',
    cageNo: 'C-102',
    type: '兔笼',
    location: 'C区1楼',
    floor: '1楼',
    room: 'C102室',
    capacity: 2,
    currentAnimals: 0,
    status: 'available',
    specification: '不锈钢兔笼',
    equipment: ['自动饮水系统'],
    createTime: '2025-01-08 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'cage-010',
    cageNo: 'C-201',
    type: '其他',
    location: 'C区2楼',
    floor: '2楼',
    room: 'C201室',
    capacity: 3,
    currentAnimals: 0,
    status: 'available',
    specification: '特殊实验笼',
    equipment: ['温度控制系统', '湿度控制系统'],
    remarks: '适用于小型猪、犬等大型动物',
    createTime: '2025-01-09 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  }
]

export const getCageById = (id: string): Cage | undefined => {
  return cageList.find(cage => cage.id === id)
}

export const getCageByNo = (cageNo: string): Cage | undefined => {
  return cageList.find(cage => cage.cageNo === cageNo)
}
