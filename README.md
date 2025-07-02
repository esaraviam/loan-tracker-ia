# Loan Tracker

A personal loan management web application built with Next.js 15, TypeScript, and Prisma.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd loan-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Set up the database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional: Add sample data
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Features

- **User Authentication**: Secure registration and login with JWT
- **Loan Management**: Create, track, and manage personal loans
- **Photo Documentation**: Upload photos for item condition tracking
- **Smart Dashboard**: Visual overview with status filters
- **Reports & Analytics**: Insights into lending patterns
- **Data Export**: Download records in CSV, JSON, or PDF

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: JWT + bcrypt

## 📱 Screenshots

### Dashboard
Real-time overview of all loans with status indicators.

### Loan Management
Easy-to-use interface for creating and tracking loans.

### Dark Mode
Full dark mode support for comfortable viewing.

## 🏗️ Architecture Decisions

1. **App Router**: Leverages Next.js 15's latest features for better performance
2. **Feature-based Structure**: Organized by features (auth, loans, dashboard) for scalability
3. **Server Components**: Optimized data fetching with React Server Components
4. **Type Safety**: Strict TypeScript with Prisma-generated types
5. **Mobile-First**: Responsive design that works seamlessly on all devices

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript validation
- `npm test` - Run tests

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for session management
- Input validation on client and server
- File upload restrictions (JPG/PNG, 5MB max)

## 📄 License

MIT License