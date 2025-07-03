'use client'

import { ReactNode, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Ensure i18n is initialized
    if (!i18n.isInitialized) {
      i18n.init().then(() => {
        setIsInitialized(true)
      })
    } else {
      setIsInitialized(true)
    }
  }, [])

  if (!isInitialized) {
    return null // Or a loading spinner
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}