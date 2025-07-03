import { getCurrentUser } from "@/lib/auth"
import { AuthButtonsClient } from "./auth-buttons-client"

export async function AuthButtons() {
  const user = await getCurrentUser()
  return <AuthButtonsClient user={user} />
}