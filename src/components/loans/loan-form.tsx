"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { loanSchema, type LoanInput } from "@/lib/validations"
import { PhotoUpload } from "./photo-upload"
import { cn } from "@/lib/utils"
import { createLoanAction } from "@/app/actions/loans"

export function LoanForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])

  const form = useForm<LoanInput>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      recipientName: "",
      itemName: "",
      description: "",
      quantity: 1,
      borrowedAt: format(new Date(), "yyyy-MM-dd"),
      returnBy: "",
      stateStart: "",
    },
  })

  async function onSubmit(data: LoanInput) {
    try {
      setIsLoading(true)

      // Create FormData to handle file uploads
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value?.toString() || "")
      })

      // Append photos
      photos.forEach((photo) => {
        formData.append("photos", photo)
      })

      const result = await createLoanAction(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create loan")
      }

      toast({
        title: "Loan created!",
        description: "Your loan has been recorded successfully.",
      })

      router.push(`/loans/${result.data?.loan.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter details about the item and borrower
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., JavaScript Book" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the loan..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        field.onChange(isNaN(value) ? 1 : value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Period</CardTitle>
            <CardDescription>
              Set the loan and expected return dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="borrowedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Loan Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} max={format(new Date(), "yyyy-MM-dd")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnBy"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Return Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={form.watch("borrowedAt")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item Condition</CardTitle>
            <CardDescription>
              Document the current state of the item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="stateStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Condition</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the current condition of the item..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific about any existing damage or wear
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxFiles={5}
              label="Item Photos"
              description="Upload photos showing the current condition (max 5 photos, 5MB each)"
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Loan
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/loans")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}