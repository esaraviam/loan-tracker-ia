export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español'
}

export function getLocaleFromPath(pathname: string): Locale | undefined {
  const segments = pathname.split('/')
  const locale = segments[1] as Locale
  
  return locales.includes(locale) ? locale : undefined
}