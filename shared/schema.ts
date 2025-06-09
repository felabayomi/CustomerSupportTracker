import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  role: text("role").notNull().default("traveler"), // traveler, agent, admin
  assignedAgentId: integer("assigned_agent_id"),
  preferences: text("preferences"), // JSON string for travel preferences
  alertsEnabled: boolean("alerts_enabled").notNull().default(true),
});

export const accessCodes = pgTable("access_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: integer("user_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: text("expires_at"), // ISO date string
  createdAt: text("created_at").notNull(),
  lastUsedAt: text("last_used_at"),
});

export const accessCodesRelations = relations(accessCodes, ({ one }) => ({
  user: one(users, {
    fields: [accessCodes.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  assignedAgent: one(users, {
    fields: [users.assignedAgentId],
    references: [users.id],
  }),
  trips: many(trips),
  chatMessages: many(chatMessages),
  supportRequests: many(supportRequests),
  notifications: many(notifications),
  feedbacks: many(feedbacks),
  accessCodes: many(accessCodes),
}));

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  description: text("description"),
});

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  activities: many(activities),
  chatMessages: many(chatMessages),
  supportRequests: many(supportRequests),
  notifications: many(notifications),
  feedbacks: many(feedbacks),
}));

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  date: text("date").notNull(),
  location: text("location"),
  type: text("type").notNull(), // tour, dining, transport, etc.
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  trip: one(trips, {
    fields: [activities.tripId],
    references: [trips.id],
  }),
}));

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tripId: integer("trip_id"),
  message: text("message").notNull(),
  sender: text("sender").notNull(), // user, agent
  agentName: text("agent_name"),
  timestamp: text("timestamp").notNull(),
  isRead: boolean("is_read").notNull().default(false),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [chatMessages.tripId],
    references: [trips.id],
  }),
}));

export const supportRequests = pgTable("support_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tripId: integer("trip_id"),
  type: text("type").notNull(), // emergency, reschedule, assistance, feedback
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull().default("normal"), // low, normal, high, emergency
  assignedAgent: text("assigned_agent"),
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
});

export const supportRequestsRelations = relations(supportRequests, ({ one }) => ({
  user: one(users, {
    fields: [supportRequests.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [supportRequests.tripId],
    references: [trips.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tripId: integer("trip_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, alert, success
  isRead: boolean("is_read").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [notifications.tripId],
    references: [trips.id],
  }),
}));

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tripId: integer("trip_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  date: text("date").notNull(),
  type: text("type").notNull().default("daily"), // daily, trip, activity
});

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [feedbacks.tripId],
    references: [trips.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true });
export const insertSupportRequestSchema = createInsertSchema(supportRequests).omit({ id: true, userId: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });
export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true, userId: true, date: true });
export const insertAccessCodeSchema = createInsertSchema(accessCodes).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type SupportRequest = typeof supportRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Feedback = typeof feedbacks.$inferSelect;
export type AccessCode = typeof accessCodes.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertAccessCode = z.infer<typeof insertAccessCodeSchema>;
