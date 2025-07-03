"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Package, ArrowRight } from "lucide-react"
import { getLoanStatus, getStatusColor, calculateDaysOverdue } from "@/lib/loan-utils"
import type { Loan, LoanPhoto } from "@prisma/client"

interface LoanCardProps {
  loan: Loan & {
    photos: LoanPhoto[]
  }
}

export function LoanCard({ loan }: LoanCardProps) {
  const status = getLoanStatus(loan)
  const statusColor = getStatusColor(status)
  const daysOverdue = calculateDaysOverdue(loan)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={loan.photos[0]?.url || "/placeholder-loan.png"}
          alt={loan.itemName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant={status === "overdue" ? "destructive" : "secondary"}
            className={statusColor}
          >
            {status}
            {status === "overdue" && ` (${daysOverdue}d)`}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <h3 className="font-semibold text-lg line-clamp-1">{loan.itemName}</h3>
        {loan.quantity > 1 && (
          <p className="text-sm text-muted-foreground">Quantity: {loan.quantity}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="line-clamp-1">{loan.recipientName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Borrowed: {format(new Date(loan.borrowedAt), "MMM d, yyyy")}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>
            {status === "returned" 
              ? `Returned: ${format(new Date(loan.returnedAt!), "MMM d, yyyy")}`
              : `Due: ${format(new Date(loan.returnBy), "MMM d, yyyy")}`
            }
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/loans/${loan.id}`} className="w-full">
          <Button variant="outline" className="w-full gap-2">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}