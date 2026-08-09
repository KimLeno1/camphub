// src/db/schema.ts
import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  bigint,
  decimal,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ENUMS
export const statusEnum = pgEnum('status', ['active', 'suspended', 'banned']);
export const visibilityEnum = pgEnum('visibility', ['public', 'private', 'invite_only']);
export const roleEnum = pgEnum('role', ['initiate', 'member', 'trusted', 'elder']);
export const channelTypeEnum = pgEnum('channel_type', ['text', 'voice', 'announcement']);
export const scanStatusEnum = pgEnum('scan_status', ['pending', 'clean', 'flagged']);
export const targetTypeEnum = pgEnum('target_type', ['user', 'message', 'resource', 'community']);
export const caseStatusEnum = pgEnum('case_status', ['gathering_jury', 'voting', 'appealed', 'resolved']);
export const decisionEnum = pgEnum('decision', ['action', 'no_action', 'abstain']);
export const penaltyTypeEnum = pgEnum('penalty_type', ['warning', 'suspension', 'ban', 'rep_deduction']);

// USERS
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  trustLevel: integer('trust_level').notNull().default(1),
  major: text('major'),
  status: statusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  version: integer('version').notNull().default(1),
});

export const userReputations = pgTable('user_reputations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'restrict' }),
  points: integer('points').notNull().default(100),
  votesCast: integer('votes_cast').notNull().default(0),
  successfulReports: integer('successful_reports').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  version: integer('version').notNull().default(1),
});

// COMMUNITIES
export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  visibility: visibilityEnum('visibility').notNull().default('public'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  version: integer('version').notNull().default(1),
});

export const communityMembers = pgTable('community_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  role: roleEnum('role').notNull().default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CHANNELS
export const channels = pgTable('channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: channelTypeEnum('type').notNull().default('text'),
  isLocked: boolean('is_locked').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  version: integer('version').notNull().default(1),
});

// MESSAGES
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: uuid('channel_id').notNull().references(() => channels.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentMessageId: uuid('parent_message_id'), // Self-referential for threads
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  version: integer('version').notNull().default(1),
});

// RESOURCES
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  uploaderId: uuid('uploader_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).notNull(),
  mimeType: text('mime_type').notNull(),
  scanStatus: scanStatusEnum('scan_status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  version: integer('version').notNull().default(1),
});

// GOVERNANCE
export const governanceCases = pgTable('governance_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  targetType: targetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  reporterId: uuid('reporter_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  reason: text('reason').notNull(),
  evidenceUrl: text('evidence_url'),
  evidenceDescription: text('evidence_description'),
  status: caseStatusEnum('status').notNull().default('gathering_jury'),
  decision: text('decision'), // 'action' | 'no_action'
  appealReason: text('appeal_reason'),
  appealDecision: text('appeal_decision'), // 'upheld' | 'reversed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  version: integer('version').notNull().default(1),
});

export const juryMembers = pgTable('jury_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => governanceCases.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  hasVoted: boolean('has_voted').notNull().default(false),
  selectedAt: timestamp('selected_at').defaultNow().notNull(),
});

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  juryMemberId: uuid('jury_member_id').notNull().unique().references(() => juryMembers.id, { onDelete: 'cascade' }),
  decision: decisionEnum('decision').notNull(),
  weight: decimal('weight').notNull(),
  justification: text('justification'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const penalties = pgTable('penalties', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  caseId: uuid('case_id').notNull().references(() => governanceCases.id, { onDelete: 'cascade' }),
  type: penaltyTypeEnum('type').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// RELATIONS
export const usersRelations = relations(users, ({ one, many }) => ({
  reputation: one(userReputations),
  memberships: many(communityMembers),
  messages: many(messages),
  resources: many(resources),
  reportedCases: many(governanceCases),
  juryDuties: many(juryMembers),
  penalties: many(penalties),
}));

export const communitiesRelations = relations(communities, ({ many }) => ({
  members: many(communityMembers),
  channels: many(channels),
  resources: many(resources),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));
