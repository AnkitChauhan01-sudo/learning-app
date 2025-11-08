# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set in your deployment platform:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Neon Database
DATABASE_URL=your_neon_database_url

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. Database Setup
Run database migrations before deployment:

```bash
npm run db:push
```

Or generate and apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 3. Google Maps API Setup
Ensure the following APIs are enabled in your Google Cloud Console:
- Maps JavaScript API
- Places API
- Routes API (for directions)
- Geocoding API

### 4. Clerk Setup
- Create a Clerk application
- Configure sign-in and sign-up URLs
- Set up webhooks if needed

### 5. Build and Test
Test the production build locally:

```bash
npm run build
npm run start
```

## Deployment Platforms

### Vercel (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
1. Build the application: `npm run build`
2. Start the production server: `npm run start`
3. Ensure Node.js 18+ is available
4. Set all environment variables

## Post-Deployment

1. Verify all routes are accessible
2. Test authentication flow
3. Test ride booking functionality
4. Test driver dashboard
5. Monitor error logs
6. Check database connections

## Troubleshooting

### Build Errors
- Check all environment variables are set
- Verify TypeScript compilation: `npx tsc --noEmit`
- Check for linting errors: `npm run lint`

### Runtime Errors
- Check browser console for client-side errors
- Check server logs for API errors
- Verify database connection
- Verify Google Maps API key is valid

### Database Issues
- Verify DATABASE_URL is correct
- Check database migrations are applied
- Verify database schema matches code

