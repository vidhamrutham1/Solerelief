import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Exercise library for plantar fasciitis recovery
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"),
  category: text("category").notNull(), // "stretching", "strengthening", "massage"
  duration: integer("duration").notNull(), // in seconds
  difficulty: text("difficulty").notNull(), // "beginner", "intermediate", "advanced"
  tags: text("tags").array().default([]),
  isCore: boolean("is_core").default(false), // core exercises for daily routine
});

// User reminders and settings
export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // For future user system
  type: text("type").notNull(), // "stretch", "walk", "check-in"
  title: text("title").notNull(),
  message: text("message").notNull(),
  time: text("time").notNull(), // HH:MM format
  days: text("days").array().notNull(), // ["monday", "tuesday", etc.]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Progress tracking for pain levels and exercise completion
export const progressEntries = pgTable("progress_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  painLevel: integer("pain_level").notNull(), // 1-10 scale
  exercisesCompleted: integer("exercises_completed").default(0),
  walkingSteps: integer("walking_steps").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Exercise completion tracking
export const exerciseCompletions = pgTable("exercise_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  exerciseId: varchar("exercise_id").notNull(),
  completedAt: timestamp("completed_at").default(sql`CURRENT_TIMESTAMP`),
  duration: integer("duration"), // actual time spent in seconds
});

// User profiles for personalized experience
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  injuryDate: text("injury_date"), // YYYY-MM-DD format
  severityLevel: text("severity_level"), // "mild", "moderate", "severe"
  goals: text("goals").array().default([]),
  preferredReminderTimes: text("preferred_reminder_times").array().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Schema validation
export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseCompletionSchema = createInsertSchema(exerciseCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;
export type ExerciseCompletion = typeof exerciseCompletions.$inferSelect;
export type InsertExerciseCompletion = z.infer<typeof insertExerciseCompletionSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
