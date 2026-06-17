export const isPhoneValid = (phone: string): boolean => {
  const phoneReg = /^1[3-9]\d{9}$/
  return phoneReg.test(phone)
}

export const isEmailValid = (email: string): boolean => {
  const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
  return emailReg.test(email)
}

export const isNotEmpty = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim() !== ''
}

export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value > 0
}

export const isDateValid = (date: string): boolean => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

export const isEndDateAfterStartDate = (startDate: string, endDate: string): boolean => {
  return new Date(endDate) >= new Date(startDate)
}

export const validateBatchNo = (batchNo: string): boolean => {
  const batchNoReg = /^[A-Za-z0-9-_]{3,50}$/
  return batchNoReg.test(batchNo)
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!isNotEmpty(value)) {
    return `${fieldName}不能为空`
  }
  return null
}

export const validatePhone = (phone: string): string | null => {
  if (!isNotEmpty(phone)) {
    return '手机号不能为空'
  }
  if (!isPhoneValid(phone)) {
    return '请输入正确的手机号'
  }
  return null
}

export const validateQuantity = (quantity: number, fieldName: string = '数量'): string | null => {
  if (quantity === undefined || quantity === null) {
    return `${fieldName}不能为空`
  }
  if (!isPositiveNumber(quantity)) {
    return `${fieldName}必须大于0`
  }
  return null
}

export const validateDateRange = (startDate: string, endDate: string): string | null => {
  if (!isDateValid(startDate)) {
    return '开始日期无效'
  }
  if (!isDateValid(endDate)) {
    return '结束日期无效'
  }
  if (!isEndDateAfterStartDate(startDate, endDate)) {
    return '结束日期必须晚于或等于开始日期'
  }
  return null
}
