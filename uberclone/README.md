# RideShare - Uber Clone Web App

A full-featured ride-sharing web application built with Next.js, featuring ride booking, driver dashboard, Google Maps integration, and rating/review system.

## Features

- 🚗 **Ride Booking**: Easy-to-use interface for booking rides with real-time fare calculation
- 🗺️ **Google Maps Integration**: Interactive map with pickup/dropoff location selection
- 👨‍✈️ **Driver Dashboard**: Complete dashboard for drivers to manage rides and availability
- ⭐ **Rating & Review System**: Rate and review drivers after completed rides
- 🔐 **Authentication**: Secure authentication using Clerk
- 💾 **Database**: PostgreSQL database using Neon DB
- 📱 **Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Authentication**: Clerk
- **Database**: Neon DB (PostgreSQL)
- **ORM**: Drizzle ORM
- **Maps**: Google Maps JavaScript API
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- A Clerk account (for authentication)
- A Neon DB account (for database)
- A Google Cloud account with Maps JavaScript API enabled

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd uberclone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory and add the following variables:

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

### 4. Set up the database

Run the database migrations to create the necessary tables:

```bash
npm run db:push
```

Or generate migrations and apply them:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
uberclone/
├── app/
│   ├── api/              # API routes
│   │   ├── drivers/      # Driver-related endpoints
│   │   ├── rides/        # Ride-related endpoints
│   │   ├── reviews/      # Review endpoints
│   │   └── users/        # User endpoints
│   ├── dashboard/        # Rider dashboard
│   ├── driver/           # Driver dashboard
│   ├── ride/             # Ride review page
│   ├── sign-in/          # Sign in page
│   ├── sign-up/          # Sign up page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── Map.tsx           # Google Maps component
│   └── AutocompleteInput.tsx  # Address autocomplete
├── lib/
│   ├── db.ts             # Database connection
│   └── schema.ts         # Database schema
├── middleware.ts         # Clerk middleware
└── drizzle.config.ts     # Drizzle configuration
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts (riders and drivers)
- **drivers**: Driver-specific information and availability
- **rides**: Ride bookings and status
- **reviews**: Ratings and reviews for completed rides

## Features in Detail

### Ride Booking
- Select pickup and dropoff locations using Google Maps
- Real-time fare calculation based on distance and duration
- Track ride status (pending, accepted, in_progress, completed)
- View ride history

### Driver Dashboard
- Register as a driver with vehicle information
- View and accept pending ride requests
- Manage ride status (start, complete)
- Toggle availability status
- View ride history and ratings

### Rating & Review System
- Rate drivers from 1-5 stars after completed rides
- Add optional comments
- View driver ratings and total rides

## API Endpoints

### Users
- `POST /api/users` - Create or get user
- `GET /api/users` - Get current user

### Rides
- `POST /api/rides` - Create a new ride
- `GET /api/rides` - Get user's rides
- `PATCH /api/rides/[id]` - Update ride status

### Drivers
- `POST /api/drivers` - Register or update driver
- `GET /api/drivers` - Get current driver
- `GET /api/drivers/available` - Get available drivers
- `GET /api/drivers/pending` - Get pending rides
- `GET /api/drivers/rides` - Get driver's rides
- `POST /api/drivers/accept` - Accept a ride
- `PATCH /api/drivers/availability` - Update availability

### Reviews
- `POST /api/reviews` - Create a review
- `GET /api/reviews` - Get reviews (with optional rideId query)

## Development

### Running in development mode

```bash
npm run dev
```

### Building for production

```bash
npm run build
npm start
```

### Database migrations

Generate migrations:
```bash
npm run db:generate
```

Push schema changes:
```bash
npm run db:push
```

## Notes

- Payment gateways are skipped as requested - fare calculation is shown but not processed
- The app uses Clerk for authentication - make sure to configure your Clerk app properly
- Google Maps API key must have the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API

## License

This project is for educational purposes.
