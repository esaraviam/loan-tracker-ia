import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { loanSchema } from "@/lib/validations"
import { validateFile } from "@/lib/upload"
import { saveMultipleFiles } from "@/lib/upload-server"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    
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

    // Create loan with photos
    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        recipientName: validatedData.recipientName,
        itemName: validatedData.itemName,
        description: validatedData.description,
        quantity: validatedData.quantity,
        borrowedAt: new Date(validatedData.borrowedAt),
        returnBy: new Date(validatedData.returnBy),
        stateStart: validatedData.stateStart,
        photos: {
          create: uploadedPhotos.map((photo) => ({
            url: photo.url,
            type: "initial",
          })),
        },
      },
      include: {
        photos: true,
      },
    })

    return NextResponse.json({ loan })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    console.error("Create loan error:", error)
    return NextResponse.json(
      { error: "Failed to create loan" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    return NextResponse.json({ loans })
  } catch (error) {
    console.error("Get loans error:", error)
    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 }
    )
  }
}