"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { loanSchema, returnLoanSchema } from "@/lib/validations"
import { validateFile } from "@/lib/upload"
import { saveMultipleFiles } from "@/lib/upload-server"
import type { ActionResult } from "./auth"

export async function createLoanAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    // Parse form data
    const data = {
      recipientName: formData.get("recipientName") as string,
      itemName: formData.get("itemName") as string,
      description: formData.get("description") as string || undefined,
      quantity: parseInt(formData.get("quantity") as string),
      borrowedAt: formData.get("borrowedAt") as string,
      returnBy: formData.get("returnBy") as string,
      stateStart: formData.get("stateStart") as string,
    }

    // Validate data
    const validatedData = loanSchema.parse(data)

    // Handle photo uploads
    const photoFiles = formData.getAll("photos") as File[]
    const uploadedPhotos: { url: string }[] = []

    if (photoFiles.length > 0) {
      // Validate all photos
      for (const photo of photoFiles) {
        const error = await validateFile(photo)
        if (error) {
          return {
            success: false,
            error
          }
        }
      }

      // Save photos
      const savedPhotos = await saveMultipleFiles(photoFiles)
      uploadedPhotos.push(...savedPhotos)
    }

    // Create loan with photos in a transaction
    const loan = await prisma.$transaction(async (tx) => {
      const newLoan = await tx.loan.create({
        data: {
          userId: user.id,
          recipientName: validatedData.recipientName,
          itemName: validatedData.itemName,
          description: validatedData.description,
          quantity: validatedData.quantity,
          borrowedAt: new Date(validatedData.borrowedAt),
          returnBy: new Date(validatedData.returnBy),
          stateStart: validatedData.stateStart,
        },
      })

      // Create photos if any
      if (uploadedPhotos.length > 0) {
        await tx.loanPhoto.createMany({
          data: uploadedPhotos.map((photo) => ({
            loanId: newLoan.id,
            url: photo.url,
            type: "initial",
          })),
        })
      }

      // Return loan with photos
      return await tx.loan.findUnique({
        where: { id: newLoan.id },
        include: { photos: true },
      })
    })

    revalidatePath("/dashboard")
    revalidatePath("/loans")

    return {
      success: true,
      data: { loan }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid input"
      }
    }

    console.error("Create loan error:", error)
    return {
      success: false,
      error: "Failed to create loan"
    }
  }
}

export async function getLoansAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        photos: {
          where: { type: "initial" },
          take: 1,
        },
      },
    })

    return {
      success: true,
      data: { loans }
    }
  } catch (error) {
    console.error("Get loans error:", error)
    return {
      success: false,
      error: "Failed to fetch loans"
    }
  }
}

export async function getLoanByIdAction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    const loan = await prisma.loan.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        photos: true,
      },
    })

    if (!loan) {
      return {
        success: false,
        error: "Loan not found"
      }
    }

    return {
      success: true,
      data: { loan }
    }
  } catch (error) {
    console.error("Get loan error:", error)
    return {
      success: false,
      error: "Failed to fetch loan"
    }
  }
}

export async function returnLoanAction(
  loanId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    // Check if loan exists and belongs to user
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId: user.id,
      },
    })

    if (!loan) {
      return {
        success: false,
        error: "Loan not found"
      }
    }

    if (loan.returnedAt) {
      return {
        success: false,
        error: "Loan already returned"
      }
    }

    // Parse form data
    const data = {
      stateEnd: formData.get("stateEnd") as string,
    }

    // Validate data
    const validatedData = returnLoanSchema.parse(data)

    // Handle photo uploads
    const photoFiles = formData.getAll("photos") as File[]
    const uploadedPhotos: { url: string }[] = []

    if (photoFiles.length > 0) {
      // Validate all photos
      for (const photo of photoFiles) {
        const error = await validateFile(photo)
        if (error) {
          return {
            success: false,
            error
          }
        }
      }

      // Save photos
      const savedPhotos = await saveMultipleFiles(photoFiles)
      uploadedPhotos.push(...savedPhotos)
    }

    // Update loan with return information
    const updatedLoan = await prisma.$transaction(async (tx) => {
      // Update loan
      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          returnedAt: new Date(),
          stateEnd: validatedData.stateEnd,
        },
      })

      // Create return photos if any
      if (uploadedPhotos.length > 0) {
        await tx.loanPhoto.createMany({
          data: uploadedPhotos.map((photo) => ({
            loanId: updated.id,
            url: photo.url,
            type: "return",
          })),
        })
      }

      // Return updated loan with photos
      return await tx.loan.findUnique({
        where: { id: updated.id },
        include: { photos: true },
      })
    })

    revalidatePath("/dashboard")
    revalidatePath(`/loans/${loanId}`)

    return {
      success: true,
      data: { loan: updatedLoan }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid input"
      }
    }

    console.error("Return loan error:", error)
    return {
      success: false,
      error: "Failed to return loan"
    }
  }
}

export async function deleteLoanAction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    // Check if loan exists and belongs to user
    const loan = await prisma.loan.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!loan) {
      return {
        success: false,
        error: "Loan not found"
      }
    }

    // Delete loan (photos will be cascade deleted)
    await prisma.loan.delete({
      where: { id },
    })

    revalidatePath("/dashboard")
    revalidatePath("/loans")

    return {
      success: true,
      data: { message: "Loan deleted successfully" }
    }
  } catch (error) {
    console.error("Delete loan error:", error)
    return {
      success: false,
      error: "Failed to delete loan"
    }
  }
}

export async function exportLoansAction(format: "csv" | "json" | "pdf"): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        photos: true,
      },
    })

    let content: string
    let mimeType: string
    let filename: string

    switch (format) {
      case "csv":
        // Generate CSV
        const headers = ["ID", "Recipient", "Item", "Quantity", "Borrowed At", "Return By", "Status", "Initial State", "Final State"]
        const rows = loans.map((loan) => [
          loan.id,
          loan.recipientName,
          loan.itemName,
          loan.quantity.toString(),
          loan.borrowedAt.toISOString().split("T")[0],
          loan.returnBy.toISOString().split("T")[0],
          loan.returnedAt ? "Returned" : new Date() > loan.returnBy ? "Overdue" : "Active",
          loan.stateStart,
          loan.stateEnd || "",
        ])
        
        content = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n")
        
        mimeType = "text/csv"
        filename = `loans-${new Date().toISOString().split("T")[0]}.csv`
        break

      case "json":
        // Generate JSON
        content = JSON.stringify(loans, null, 2)
        mimeType = "application/json"
        filename = `loans-${new Date().toISOString().split("T")[0]}.json`
        break

      case "pdf":
        // For PDF, we'll return the data and let the client handle PDF generation
        return {
          success: true,
          data: { 
            loans,
            format: "pdf",
            message: "Use the loan data to generate PDF on the client side"
          }
        }

      default:
        return {
          success: false,
          error: "Invalid format"
        }
    }

    return {
      success: true,
      data: {
        content,
        mimeType,
        filename
      }
    }
  } catch (error) {
    console.error("Export loans error:", error)
    return {
      success: false,
      error: "Failed to export loans"
    }
  }
}