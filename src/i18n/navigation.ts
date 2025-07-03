import { createNavigation } from 'next-intl/navigation'
import { locales, type Locale } from './config'

export const { Link, redirect, usePathname, useRouter } = 
  createNavigation({ locales })

// Helper to create locale-aware paths
export function createLocalePath(path: string, locale: Locale): string {
  return `/${locale}${path}`
}