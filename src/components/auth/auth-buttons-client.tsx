'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"
import { useTranslation } from 'react-i18next'

interface AuthButtonsClientProps {
  user: any
}

export function AuthButtonsClient({ user }: AuthButtonsClientProps) {
  const { t } = useTranslation()

  if (user) {
    return <UserNav email={user.email} />
  }

  return (
    <>
      <Link href="/login">
        <Button variant="ghost" size="sm">
          {t('nav.login')}
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm">{t('nav.getStarted')}</Button>
      </Link>
    </>
  )
}