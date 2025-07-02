import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { returnLoanSchema } from "@/lib/validations"
import { validateFile } from "@/lib/upload"
import { saveMultipleFiles } from "@/lib/upload-server"
import { z } from "zod"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if loan exists and belongs to user
    const loan = await prisma.loan.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    if (loan.returnedAt) {
      return NextResponse.json(
        { error: "Loan already marked as returned" },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    
    // Parse form data
    const data = {
      stateEnd: formData.get("stateEnd") as string,
    }

    // Validate data
    const validatedData = returnLoanSchema.parse(data)

    // Handle photo uploads
    const photoFiles = formData.getAll("photos") as File[]
    const uploadedPhotos = []

    if (photoFiles.length > 0) {
      // Validate all photos
      for (const photo of photoFiles) {
        const error = await validateFile(photo)
        if (error) {
          return NextResponse.json({ error }, { status: 400 })
        }
      }

      // Save photos
      const savedPhotos = await saveMultipleFiles(photoFiles)
      uploadedPhotos.push(...savedPhotos)
    }

    // Update loan with return information
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        returnedAt: new Date(),
        stateEnd: validatedData.stateEnd,
        photos: {
          create: uploadedPhotos.map((photo) => ({
            url: photo.url,
            type: "return",
          })),
        },
      },
      include: {
        photos: true,
      },
    })

    return NextResponse.json({ loan: updatedLoan })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    console.error("Return loan error:", error)
    return NextResponse.json(
      { error: "Failed to mark loan as returned" },
      { status: 500 }
    )
  }
}