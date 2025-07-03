"use client"

import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export function AuthButtons() {
  const t = useTranslations()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return null
  }

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