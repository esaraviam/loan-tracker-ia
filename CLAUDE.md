# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Loan Tracker UI** - A personal loan management web application where users can register, monitor, and manage loans of objects to third parties. This is a coding challenge that evaluates UI/UX, code quality, and front-end architecture.

## Technology Stack (Required)

- **Framework**: Next.js 15.3 (App Router + RSC)
- **Styling**: Tailwind CSS 4.0
- **UI Kit**: shadcn/ui
- **Database**: SQLite + Prisma ORM
- **Language**: TypeScript (strict mode)
- **Authentication**: JWT tokens with bcrypt for password hashing

## Core Requirements

### User Stories

1. **REQ-001: User Registration**
   - Email/password registration
   - Email validation (valid format, required)
   - Password validation (≥8 chars, uppercase, lowercase, number)

2. **REQ-002: Login**
   - Credential validation
   - Redirect to dashboard after successful login

3. **REQ-003: Register Loan**
   - Item name and recipient (≤100 chars)
   - Quantity (> 0)
   - Loan date (≤ today), return date (after loan date)
   - Initial condition (required)
   - Photo upload (JPG/PNG ≤ 5 MB)

4. **REQ-004: Dashboard**
   - Visual summary of active, overdue, and returned loans
   - Filters by status and date
   - Authenticated users only

5. **REQ-005: Mark Return**
   - Only for active loans
   - Final condition (≤ 200 chars)
   - Return photos (JPG/PNG ≤ 5 MB)

## Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  loans         Loan[]
  passwordResets PasswordReset[]
}

model Loan {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  recipientName String    @map("recipient_name")
  itemName      String    @map("item_name")
  description   String?
  quantity      Int
  borrowedAt    DateTime  @map("borrowed_at")
  returnBy      DateTime  @map("return_by")
  returnedAt    DateTime? @map("returned_at")
  stateStart    String    @map("state_start")
  stateEnd      String?   @map("state_end")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  photos        LoanPhoto[]
  reminders     ReminderLog[]
}

model LoanPhoto {
  id         String   @id @default(cuid())
  loanId     String   @map("loan_id")
  url        String
  uploadedAt DateTime @default(now()) @map("uploaded_at")
  type       String   // "initial" or "return"
  loan       Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)
}
```

## UI/UX Requirements

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Full implementation with shadcn/ui
- **Accessibility**: Basic a11y standards
- **Loading States**: Appropriate feedback for all async operations
- **Error Handling**: User-friendly error messages

## Key UI Components

1. **Landing Page** with login/register options
2. **Authentication Forms** with real-time validation
3. **Dashboard** with loan summary cards and filters
4. **Loan Creation Form** with multi-photo upload
5. **Loan Detail View** with return option
6. **Return Form** with final state photos

## Loan States

- **Active**: `returned_at` is NULL and `return_by` > current date
- **Overdue**: `returned_at` is NULL and `return_by` < current date
- **Returned**: `returned_at` has value

## Development Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components (atomic design)
- `src/features/` - Feature modules (auth, dashboard, loans)
- `src/lib/` - Utilities and shared logic
- `prisma/` - Database schema and migrations
- `public/uploads/` - User uploaded files

## Security Requirements

- Input sanitization for XSS prevention
- Server-side validation for all forms
- File type and size validation
- Protected routes with middleware
- Secure password hashing with bcrypt

## Evaluation Criteria

- **35%** - Clean TypeScript code with strict mode
- **25%** - UI/UX excellence with responsive design
- **20%** - Solid architecture with proper separation
- **10%** - Performance and developer experience
- **10%** - Clear documentation and delivery

## Time Constraints

- 8 effective hours within 7 days
- Prioritize core functionality over advanced features
- Delivery must be functional and deployable

## Notes

- Use Route Handlers (`/api/**`) or Server Actions for data operations
- Follow Next.js 15 App Router conventions
- Implement proper loading and error states
- All forms need client and server validation
- File uploads should be handled securely