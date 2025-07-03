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
- **Dark Mode**: Full theme support with system preference detection
- **Responsive Design**: Mobile-first approach for all devices
- **Real-time Validation**: Form validation with helpful error messages

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 15.1 (App Router + React Server Components)
- **Language**: TypeScript 5.7 (strict mode)
- **Database**: SQLite (dev) / PostgreSQL (prod) + Prisma ORM 5.22
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **Authentication**: Custom JWT implementation with bcryptjs

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon system
- **Recharts**: Data visualization for analytics
- **React Dropzone**: File upload handling
- **date-fns**: Date manipulation and formatting
- **React Hook Form**: Form state management with Zod validation

### Development & Testing
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting
- **Commitlint**: Enforce conventional commits

### Infrastructure Ready
- **Vercel**: Optimized for deployment
- **Edge Runtime**: Compatible with serverless functions
- **API Routes**: RESTful endpoints for all operations

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
4. **Type Safety**: Strict TypeScript with Prisma-generated types and Zod validation
5. **Mobile-First**: Responsive design that works seamlessly on all devices
6. **API Design**: RESTful endpoints with consistent error handling
7. **Edge-Ready**: Compatible with serverless and edge runtimes

## 📁 Project Structure

```
app/                    # Next.js App Router pages
├── (auth)/            # Authentication pages
├── (dashboard)/       # Protected dashboard pages
└── api/               # API route handlers

src/
├── components/        # Reusable UI components
│   ├── auth/         # Authentication components
│   ├── dashboard/    # Dashboard widgets
│   ├── loans/        # Loan management components
│   ├── reports/      # Analytics components
│   └── ui/           # shadcn/ui components
├── lib/              # Utilities and shared logic
│   ├── auth.ts       # Authentication helpers
│   ├── prisma.ts     # Database client
│   └── validations.ts # Zod schemas
└── hooks/            # Custom React hooks
```

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

## 🤝 Contributing

Please read our contributing guidelines before submitting PRs.

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification. All commits must be semantic.

#### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Other changes that don't modify src or test files

#### Examples

```bash
feat(auth): add password reset functionality
fix(loans): correct date calculation for overdue loans
docs(api): update API documentation for loan endpoints
refactor(dashboard): simplify stats calculation logic
```

#### Commit Message Template

A git commit template is configured in `.gitmessage`. To use it:

```bash
git config --local commit.template .gitmessage
```

## 📄 License

MIT License