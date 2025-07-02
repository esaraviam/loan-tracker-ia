import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { getCurrentUser } from "@/lib/auth"
import { ArrowRight, Shield, Clock, BarChart3 } from "lucide-react"

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center space-y-8 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Track Your Personal Loans
            <span className="block text-primary">With Confidence</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Never lose track of items you&apos;ve lent out. Manage loans, set
            reminders, and keep a photo record of your valuable possessions.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Start Tracking Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="container py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why Choose Loan Tracker?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and stored securely. Only you have
                access to your loan records.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Set return dates and get timely reminders so you never forget
                about your loaned items.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Visual Dashboard</h3>
              <p className="text-muted-foreground">
                Get insights into your lending patterns with an intuitive
                dashboard and filters.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Loan Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}