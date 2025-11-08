import { pgTable, text, timestamp, uuid, decimal, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['rider', 'driver']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('rider'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  licenseNumber: text('license_number').notNull(),
  vehicleModel: text('vehicle_model').notNull(),
  vehicleColor: text('vehicle_color').notNull(),
  vehiclePlate: text('vehicle_plate').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  currentLat: decimal('current_lat', { precision: 10, scale: 8 }),
  currentLng: decimal('current_lng', { precision: 11, scale: 8 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalRides: integer('total_rides').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rides = pgTable('rides', {
  id: uuid('id').primaryKey().defaultRandom(),
  riderId: uuid('rider_id').references(() => users.id).notNull(),
  driverId: uuid('driver_id').references(() => drivers.id),
  pickupLat: decimal('pickup_lat', { precision: 10, scale: 8 }).notNull(),
  pickupLng: decimal('pickup_lng', { precision: 11, scale: 8 }).notNull(),
  pickupAddress: text('pickup_address').notNull(),
  dropoffLat: decimal('dropoff_lat', { precision: 10, scale: 8 }).notNull(),
  dropoffLng: decimal('dropoff_lng', { precision: 11, scale: 8 }).notNull(),
  dropoffAddress: text('dropoff_address').notNull(),
  status: text('status').notNull().default('pending'), // pending, accepted, in_progress, completed, cancelled
  fare: decimal('fare', { precision: 10, scale: 2 }),
  distance: decimal('distance', { precision: 10, scale: 2 }), // in km
  duration: integer('duration'), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  rideId: uuid('ride_id').references(() => rides.id).notNull().unique(),
  riderId: uuid('rider_id').references(() => users.id).notNull(),
  driverId: uuid('driver_id').references(() => drivers.id).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

