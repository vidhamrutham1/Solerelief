import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertExerciseSchema, 
  insertReminderSchema, 
  insertProgressEntrySchema,
  insertExerciseCompletionSchema,
  insertUserProfileSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = "default-user";

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category, difficulty, isCore } = req.query;
      const exercises = await storage.getExercises({
        category: category as string,
        difficulty: difficulty as string,
        isCore: isCore === 'true' ? true : isCore === 'false' ? false : undefined,
      });
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const validatedData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(validatedData);
      res.status(201).json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || DEFAULT_USER_ID;
      const reminders = await storage.getReminders(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse({
        ...req.body,
        userId: req.body.userId || DEFAULT_USER_ID
      });
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      res.status(400).json({ message: "Invalid reminder data" });
    }
  });

  app.put("/api/reminders/:id", async (req, res) => {
    try {
      const reminder = await storage.updateReminder(req.params.id, req.body);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteReminder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Progress tracking routes
  app.get("/api/progress", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || DEFAULT_USER_ID;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getProgressEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress entries" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertProgressEntrySchema.parse({
        ...req.body,
        userId: req.body.userId || DEFAULT_USER_ID
      });
      const entry = await storage.createProgressEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  app.get("/api/progress/:date", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || DEFAULT_USER_ID;
      const entry = await storage.getProgressEntry(userId, req.params.date);
      if (!entry) {
        return res.status(404).json({ message: "Progress entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress entry" });
    }
  });

  // Exercise completion routes
  app.post("/api/exercise-completions", async (req, res) => {
    try {
      const validatedData = insertExerciseCompletionSchema.parse({
        ...req.body,
        userId: req.body.userId || DEFAULT_USER_ID
      });
      const completion = await storage.createExerciseCompletion(validatedData);
      res.status(201).json(completion);
    } catch (error) {
      res.status(400).json({ message: "Invalid completion data" });
    }
  });

  app.get("/api/exercise-completions", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || DEFAULT_USER_ID;
      const date = req.query.date as string;
      const completions = await storage.getExerciseCompletions(userId, date);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise completions" });
    }
  });

  // User profile routes
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  app.put("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.updateUserProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
