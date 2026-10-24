import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  index,
  uniqueIndex,
  integer,
} from 'drizzle-orm/pg-core'
export const profiles = pgTable('profiles', {
  id: text().primaryKey(),
  username: text().notNull().unique(),
  preferences: jsonb().notNull().default({}),
  privacy: text().notNull().default('private'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const records = pgTable(
  'learning_records',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    kind: text().notNull(),
    title: text().notNull(),
    data: jsonb().notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('records_owner_kind').on(t.userId, t.kind)],
)
export const friendships = pgTable(
  'friendships',
  {
    id: uuid().defaultRandom().primaryKey(),
    sender: text()
      .notNull()
      .references(() => profiles.id),
    recipient: text()
      .notNull()
      .references(() => profiles.id),
    status: text().notNull().default('pending'),
  },
  (t) => [uniqueIndex('friend_pair').on(t.sender, t.recipient)],
)
export const usage = pgTable(
  'ai_usage',
  {
    userId: text('user_id').notNull(),
    minute: text().notNull(),
    count: integer().notNull().default(1),
  },
  (t) => [uniqueIndex('usage_user_minute').on(t.userId, t.minute)],
)
