import Image from "next/image"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Package, Clock, CheckCircle } from "lucide-react"
import { getLoanStatus, getStatusColor, calculateDaysOverdue, calculateLoanDuration } from "@/lib/loan-utils"
import type { Loan, LoanPhoto } from "@prisma/client"

interface LoanDetailProps {
  loan: Loan & {
    photos: LoanPhoto[]
  }
}

export function LoanDetail({ loan }: LoanDetailProps) {
  const status = getLoanStatus(loan)
  const statusColor = getStatusColor(status)
  const daysOverdue = calculateDaysOverdue(loan)
  const duration = calculateLoanDuration(loan)
  
  const initialPhotos = loan.photos.filter(p => p.type === "initial")
  const returnPhotos = loan.photos.filter(p => p.type === "return")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Loan Information</CardTitle>
            <Badge
              variant={status === "overdue" ? "destructive" : "secondary"}
              className={statusColor}
            >
              {status}
              {status === "overdue" && ` (${daysOverdue} days)`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Recipient</p>
                  <p className="font-medium">{loan.recipientName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{loan.quantity}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Loan Date</p>
                  <p className="font-medium">
                    {format(new Date(loan.borrowedAt), "PPP")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {status === "returned" ? (
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {status === "returned" ? "Return Date" : "Expected Return"}
                  </p>
                  <p className="font-medium">
                    {status === "returned" && loan.returnedAt
                      ? format(new Date(loan.returnedAt), "PPP")
                      : format(new Date(loan.returnBy), "PPP")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loan.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{loan.description}</p>
              </div>
            </>
          )}

          <Separator />
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="text-sm font-medium">{duration} days</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Condition</CardTitle>
          <CardDescription>
            Documentation of the item&apos;s condition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Initial Condition</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {loan.stateStart}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {initialPhotos.length > 0 ? (
                initialPhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square">
                    <Image
                      src={photo.url}
                      alt="Initial condition"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))
              ) : (
                <div className="relative aspect-square">
                  <Image
                    src="/placeholder-loan.png"
                    alt="No image available"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {loan.stateEnd && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Return Condition</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {loan.stateEnd}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {returnPhotos.length > 0 ? (
                    returnPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square">
                        <Image
                          src={photo.url}
                          alt="Return condition"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="relative aspect-square">
                      <Image
                        src="/placeholder-loan.png"
                        alt="No image available"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}