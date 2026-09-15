import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  role: text('role').notNull(),
  wardId: text('ward_id'),
  preferredLanguage: text('preferred_language').notNull().default('en'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
});

export const authSessions = pgTable('auth_sessions', {
  token: text('token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
});

export const serviceTickets = pgTable('service_tickets', {
  id: text('id').primaryKey(),
  domain: text('domain').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  wardId: text('ward_id').notNull(),
  reporterId: text('reporter_id')
    .notNull()
    .references(() => users.id),
  assigneeId: text('assignee_id'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  slaHours: integer('sla_hours').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'string' }),
});

export const pickupBookings = pgTable('pickup_bookings', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => users.id),
  wardId: text('ward_id').notNull(),
  address: text('address').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  items: text('items').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
});

export const communityEvents = pgTable('community_events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  wardId: text('ward_id').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true, mode: 'string' }).notNull(),
  slots: integer('slots'),
  enrolled: integer('enrolled').notNull().default(0),
});

export const notificationOutbox = pgTable('notification_outbox', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  channel: text('channel').notNull(),
  recipient: text('recipient').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
});
