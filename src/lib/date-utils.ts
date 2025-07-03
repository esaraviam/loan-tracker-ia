import { format } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import i18n from './i18n'

const locales: Record<string, Locale> = {
  en: enUS,
  es: es,
}

export function formatDate(date: Date | string, formatStr: string = 'PP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const currentLanguage = i18n.language || 'en'
  const locale = locales[currentLanguage] || enUS
  
  return format(dateObj, formatStr, { locale })
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy')
}

export function formatDateLong(date: Date | string): string {
  return formatDate(date, 'PPPP')
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'PPp')
}

export function formatCurrency(amount: number): string {
  const currentLanguage = i18n.language || 'en'
  const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currentLanguage === 'es' ? 'EUR' : 'USD',
  }).format(amount)
}

export function formatNumber(num: number): string {
  const currentLanguage = i18n.language || 'en'
  const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US'
  
  return new Intl.NumberFormat(locale).format(num)
}