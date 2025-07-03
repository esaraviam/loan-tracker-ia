import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { UserNav } from "./user-nav"
import { getTranslations } from "next-intl/server"

export async function AuthButtons() {
  const user = await getCurrentUser()
  const t = await getTranslations()

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