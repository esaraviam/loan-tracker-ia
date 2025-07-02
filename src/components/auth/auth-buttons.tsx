import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { UserNav } from "./user-nav"

export async function AuthButtons() {
  const user = await getCurrentUser()

  if (user) {
    return <UserNav email={user.email} />
  }

  return (
    <>
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Login
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm">Get Started</Button>
      </Link>
    </>
  )
}