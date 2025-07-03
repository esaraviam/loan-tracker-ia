# Deployment Guide for Vercel

## Prerequisites

1. A Vercel account
2. Vercel CLI installed (optional): `npm i -g vercel`
3. A PostgreSQL database (for production)

## Environment Variables

You need to set the following environment variables in Vercel:

### Required Variables

1. **DATABASE_URL**
   - For production, use a PostgreSQL database URL
   - Example: `postgresql://user:password@host:port/database?schema=public`
   - Recommended providers: Vercel Postgres, Neon, Supabase, or Railway

2. **JWT_SECRET**
   - A secure random string for JWT token signing
   - Generate one with: `openssl rand -base64 32`
   - Example: `your-super-secret-jwt-key-here`

3. **JWT_EXPIRE_TIME**
   - Token expiration time
   - Default: `7d`
   - Options: `1d`, `7d`, `30d`, etc.

4. **NEXTAUTH_URL**
   - Your production URL
   - Example: `https://your-app.vercel.app`

### Optional Variables

5. **MAX_FILE_SIZE**
   - Maximum file upload size in bytes
   - Default: `5242880` (5MB)

6. **UPLOAD_DIR**
   - Directory for uploads (not used in Vercel, files should go to external storage)
   - Default: `./public/uploads`

## Database Setup

Since SQLite doesn't work in Vercel's serverless environment, you need to use PostgreSQL:

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Create a new Postgres database
5. It will automatically add the DATABASE_URL

### Option 2: External PostgreSQL
1. Create a PostgreSQL database (Neon, Supabase, Railway, etc.)
2. Get the connection string
3. Add it as DATABASE_URL in Vercel

### Update Prisma Schema

Update `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Deployment Steps

### Using Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Click "Deploy"

### Using Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Set environment variables: `vercel env add`

## Post-Deployment

1. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

## File Uploads in Production

For production, you should use external storage for file uploads:

1. **Vercel Blob Storage** (Recommended)
2. **AWS S3**
3. **Cloudinary**
4. **UploadThing**

Update the upload logic in `src/lib/upload-server.ts` to use your chosen storage provider.

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly set
- Check if the database allows connections from Vercel's IP ranges
- For Vercel Postgres, connections are automatically configured

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Runtime Errors
- Check function logs in Vercel dashboard
- Ensure all environment variables are set
- Check for any hardcoded localhost URLs