# Manual Testing Guide for Server Actions

## Test User Credentials
- **Email**: test@example.com
- **Password**: Password123

## 1. Authentication Tests

### Login Test
1. Visit http://localhost:3000/login
2. Enter the test credentials above
3. Click "Sign In"
4. You should be redirected to the dashboard

### Registration Test
1. Visit http://localhost:3000/register
2. Use a new email (e.g., newuser@example.com)
3. Password must have: 8+ chars, uppercase, lowercase, number
4. Click "Create Account"
5. You should be auto-logged in and redirected to dashboard

### Logout Test
1. While logged in, click on your email in the top right
2. Click "Logout"
3. You should be redirected to the home page

## 2. Loan Management Tests

### Create Loan Test
1. While logged in, go to http://localhost:3000/loans/new
2. Fill in the form:
   - Recipient: John Doe
   - Item: Test Book
   - Quantity: 1
   - Description: Testing server actions
   - Loan Date: Today
   - Return By: Next week
   - Initial Condition: Good condition
3. Optionally add photos
4. Click "Create Loan"
5. You should be redirected to the loan detail page

### View Loans Test
1. Go to http://localhost:3000/loans
2. You should see your created loans
3. Click on a loan to view details

### Return Loan Test
1. On a loan detail page, click "Mark as Returned"
2. Enter final condition (e.g., "Returned in good condition")
3. Optionally add return photos
4. Click "Confirm Return"
5. The loan should be marked as returned

## 3. Dashboard Tests
1. Visit http://localhost:3000/dashboard
2. You should see:
   - Loan statistics (total, active, overdue, returned)
   - Recent loans list
   - Charts and visualizations

## Common Issues & Solutions

### If login doesn't work:
- Check browser console for errors
- Ensure cookies are enabled
- Try hard refresh (Ctrl+F5)

### If Server Actions fail:
- Check Network tab in browser DevTools
- Look for any 500 errors
- Check terminal for server errors

### Database Issues:
Run these commands to reset:
```bash
rm prisma/dev.db
npx prisma db push
node test-basic-flow.mjs
```