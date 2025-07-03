import { Header } from "@/components/layout/header"
import { getCurrentUser } from "@/lib/auth"
import { LandingPageContent } from "@/components/landing-page"

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <LandingPageContent user={user} />
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Loan Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}