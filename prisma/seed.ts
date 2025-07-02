import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Start seeding...")

  // Create test user
  const hashedPassword = await bcrypt.hash("TestUser123", 12)
  
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: hashedPassword,
    },
  })

  console.log(`Created user with email: ${user.email}`)

  // Create sample loans
  const loans = [
    {
      recipientName: "John Doe",
      itemName: "JavaScript: The Good Parts",
      description: "O'Reilly book about JavaScript",
      quantity: 1,
      borrowedAt: new Date("2024-06-01"),
      returnBy: new Date("2024-07-01"),
      returnedAt: new Date("2024-06-28"),
      stateStart: "Excellent condition, no marks or tears",
      stateEnd: "Returned in same condition",
    },
    {
      recipientName: "Jane Smith",
      itemName: "MacBook Charger",
      description: "Apple 65W USB-C charger",
      quantity: 1,
      borrowedAt: new Date("2024-06-15"),
      returnBy: new Date("2024-06-20"),
      returnedAt: null,
      stateStart: "Working perfectly, cable in good condition",
      stateEnd: null,
    },
    {
      recipientName: "Bob Johnson",
      itemName: "Camping Tent",
      description: "4-person waterproof tent",
      quantity: 1,
      borrowedAt: new Date("2024-05-01"),
      returnBy: new Date("2024-05-15"),
      returnedAt: null,
      stateStart: "Clean, all parts included, no damage",
      stateEnd: null,
    },
    {
      recipientName: "Alice Brown",
      itemName: "Board Games Collection",
      description: "Settlers of Catan, Ticket to Ride, Pandemic",
      quantity: 3,
      borrowedAt: new Date("2024-06-20"),
      returnBy: new Date("2024-07-20"),
      returnedAt: null,
      stateStart: "All pieces complete, boxes in good condition",
      stateEnd: null,
    },
    {
      recipientName: "Charlie Wilson",
      itemName: "Power Drill",
      description: "Cordless DeWalt 20V drill with bits",
      quantity: 1,
      borrowedAt: new Date("2024-06-25"),
      returnBy: new Date("2024-07-02"),
      returnedAt: null,
      stateStart: "Battery fully charged, all bits included",
      stateEnd: null,
    },
  ]

  for (const loanData of loans) {
    const loan = await prisma.loan.create({
      data: {
        ...loanData,
        userId: user.id,
      },
    })

    // Add sample photos for some loans
    if (Math.random() > 0.5) {
      await prisma.loanPhoto.create({
        data: {
          loanId: loan.id,
          url: `/uploads/sample-${loan.id}-initial.jpg`,
          type: "initial",
        },
      })

      if (loan.returnedAt) {
        await prisma.loanPhoto.create({
          data: {
            loanId: loan.id,
            url: `/uploads/sample-${loan.id}-return.jpg`,
            type: "return",
          },
        })
      }
    }

    console.log(`Created loan: ${loan.itemName} to ${loan.recipientName}`)
  }

  console.log("Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })