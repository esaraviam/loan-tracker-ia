"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { returnLoanSchema, type ReturnLoanInput } from "@/lib/validations"
import { PhotoUpload } from "./photo-upload"

interface ReturnLoanDialogProps {
  loanId: string
}

export function ReturnLoanDialog({ loanId }: ReturnLoanDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])

  const form = useForm<ReturnLoanInput>({
    resolver: zodResolver(returnLoanSchema),
    defaultValues: {
      stateEnd: "",
    },
  })

  async function onSubmit(data: ReturnLoanInput) {
    try {
      setIsLoading(true)

      // Create FormData to handle file uploads
      const formData = new FormData()
      formData.append("stateEnd", data.stateEnd)

      // Append photos
      photos.forEach((photo) => {
        formData.append("photos", photo)
      })

      const response = await fetch(`/api/loans/${loanId}/return`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to mark loan as returned")
      }

      toast({
        title: "Loan marked as returned!",
        description: "The loan has been successfully updated.",
      })

      setOpen(false)
      router.refresh()
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PackageCheck className="h-4 w-4" />
          Mark as Returned
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark Loan as Returned</DialogTitle>
          <DialogDescription>
            Document the condition of the item upon return
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="stateEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Condition</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the condition of the item upon return..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Note any damage, wear, or changes since the loan began
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxFiles={5}
              label="Return Photos"
              description="Upload photos showing the current condition (max 5 photos, 5MB each)"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Return
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}