import { 
  type Exercise, type InsertExercise, 
  type Reminder, type InsertReminder,
  type ProgressEntry, type InsertProgressEntry,
  type ExerciseCompletion, type InsertExerciseCompletion,
  type UserProfile, type InsertUserProfile
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Exercises
  getExercises(filters?: { category?: string; difficulty?: string; isCore?: boolean }): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  
  // Reminders
  getReminders(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;
  
  // Progress tracking
  getProgressEntries(userId: string, limit?: number): Promise<ProgressEntry[]>;
  createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  getProgressEntry(userId: string, date: string): Promise<ProgressEntry | undefined>;
  updateProgressEntry(id: string, entry: Partial<InsertProgressEntry>): Promise<ProgressEntry | undefined>;
  
  // Exercise completions
  createExerciseCompletion(completion: InsertExerciseCompletion): Promise<ExerciseCompletion>;
  getExerciseCompletions(userId: string, date?: string): Promise<ExerciseCompletion[]>;
  
  // User profiles
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
}

export class MemStorage implements IStorage {
  private exercises: Map<string, Exercise>;
  private reminders: Map<string, Reminder>;
  private progressEntries: Map<string, ProgressEntry>;
  private exerciseCompletions: Map<string, ExerciseCompletion>;
  private userProfiles: Map<string, UserProfile>;

  constructor() {
    this.exercises = new Map();
    this.reminders = new Map();
    this.progressEntries = new Map();
    this.exerciseCompletions = new Map();
    this.userProfiles = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize exercises for plantar fasciitis recovery
    const exercisesData: InsertExercise[] = [
      {
        name: "Calf Stretch",
        description: "Stretch your calf muscles to relieve tension on the plantar fascia",
        instructions: "Stand arm's length from a wall. Place your right foot behind your left foot. Slowly bend your left leg forward, keeping your right knee straight and your right heel on the ground. Hold the stretch for 15-30 seconds and switch sides.",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: "https://example.com/calf-stretch-video",
        category: "stretching",
        duration: 60,
        difficulty: "beginner",
        tags: ["calf", "wall", "morning"],
        isCore: true
      },
      {
        name: "Plantar Fascia Stretch",
        description: "Direct stretch for the plantar fascia tissue",
        instructions: "Sit with your affected foot across your opposite thigh. Pull your toes back toward your shin until you feel a stretch in your arch. Hold for 15-30 seconds and repeat 2-4 times.",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: null,
        category: "stretching",
        duration: 90,
        difficulty: "beginner",
        tags: ["arch", "sitting", "direct"],
        isCore: true
      },
      {
        name: "Towel Stretch",
        description: "Gentle stretch using a towel for assistance",
        instructions: "Sit on the floor with your legs straight. Place a towel around the ball of your foot and pull the towel toward you while keeping your knee straight. Hold for 15-30 seconds.",
        imageUrl: "https://images.unsplash.com/photo-1506629905920-0c1bbaa3d7c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: null,
        category: "stretching",
        duration: 45,
        difficulty: "beginner",
        tags: ["towel", "morning", "seated"],
        isCore: true
      },
      {
        name: "Rolling Stretch",
        description: "Use a tennis ball or frozen water bottle to massage the plantar fascia",
        instructions: "While sitting, roll a tennis ball or frozen water bottle under your foot from heel to toes. Apply gentle pressure and roll for 1-2 minutes.",
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: null,
        category: "massage",
        duration: 120,
        difficulty: "beginner",
        tags: ["tennis ball", "ice", "massage"],
        isCore: true
      },
      {
        name: "Toe Curls",
        description: "Strengthen the muscles in your feet and toes",
        instructions: "Sit in a chair and place a small towel on the floor in front of you. Use your toes to scrunch up the towel and pull it toward you. Repeat 10-15 times.",
        imageUrl: "https://images.unsplash.com/photo-1577221084712-45b0445d2b00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: null,
        category: "strengthening",
        duration: 180,
        difficulty: "intermediate",
        tags: ["toes", "towel", "strength"],
        isCore: false
      },
      {
        name: "Marble Pickup",
        description: "Improve toe strength and dexterity",
        instructions: "Sit in a chair and place 10-20 marbles on the floor in front of you. Use your toes to pick up each marble and place it in a bowl. Repeat with both feet.",
        imageUrl: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: null,
        category: "strengthening",
        duration: 300,
        difficulty: "intermediate",
        tags: ["marbles", "dexterity", "fine motor"],
        isCore: false
      },
      {
        name: "Heel Raises",
        description: "Strengthen your calf muscles",
        instructions: "Stand with your feet hip-width apart. Slowly rise up onto your toes, hold for 2-3 seconds, then lower back down. Repeat 10-15 times.",
        imageUrl: "https://images.unsplash.com/photo-1518459384694-1251681c6ee5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: null,
        category: "strengthening",
        duration: 120,
        difficulty: "beginner",
        tags: ["calf", "standing", "balance"],
        isCore: false
      },
      {
        name: "Achilles Stretch",
        description: "Stretch the Achilles tendon to reduce plantar fascia tension",
        instructions: "Stand facing a wall with hands flat against it. Step your right foot back and press your heel down. Bend your front knee and lean forward. Hold for 15-30 seconds and switch sides.",
        imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        videoUrl: null,
        category: "stretching",
        duration: 60,
        difficulty: "beginner",
        tags: ["achilles", "wall", "calf"],
        isCore: true
      }
    ];

    exercisesData.forEach(exerciseData => {
      const id = randomUUID();
      const exercise: Exercise = { ...exerciseData, id };
      this.exercises.set(id, exercise);
    });

    // Initialize default reminders
    const defaultUserId = "default-user";
    const remindersData: InsertReminder[] = [
      {
        userId: defaultUserId,
        type: "stretch",
        title: "Morning Stretch Session",
        message: "Start your day with gentle stretches to reduce morning stiffness",
        time: "08:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        isActive: true
      },
      {
        userId: defaultUserId,
        type: "stretch",
        title: "Evening Recovery",
        message: "End your day with relaxing stretches for better recovery",
        time: "19:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        isActive: true
      },
      {
        userId: defaultUserId,
        type: "walk",
        title: "Gentle Walk Reminder",
        message: "Take a gentle walk to promote healing and circulation",
        time: "14:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        isActive: true
      },
      {
        userId: defaultUserId,
        type: "check-in",
        title: "Daily Progress Check",
        message: "How are you feeling today? Log your pain level and progress",
        time: "20:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        isActive: true
      }
    ];

    remindersData.forEach(reminderData => {
      const id = randomUUID();
      const reminder: Reminder = { 
        ...reminderData, 
        id,
        createdAt: new Date()
      };
      this.reminders.set(id, reminder);
    });

    // Initialize default user profile
    const defaultProfile: InsertUserProfile = {
      name: "New User",
      injuryDate: null,
      severityLevel: "moderate",
      goals: ["Reduce morning pain", "Return to normal activities", "Prevent re-injury"],
      preferredReminderTimes: ["08:00", "14:00", "19:00", "20:00"]
    };

    const profileId = defaultUserId;
    const profile: UserProfile = { 
      ...defaultProfile, 
      id: profileId,
      createdAt: new Date()
    };
    this.userProfiles.set(profileId, profile);
  }

  // Exercise methods
  async getExercises(filters?: { category?: string; difficulty?: string; isCore?: boolean }): Promise<Exercise[]> {
    let exercises = Array.from(this.exercises.values());
    
    if (filters?.category) {
      exercises = exercises.filter(e => e.category === filters.category);
    }
    
    if (filters?.difficulty) {
      exercises = exercises.filter(e => e.difficulty === filters.difficulty);
    }
    
    if (filters?.isCore !== undefined) {
      exercises = exercises.filter(e => e.isCore === filters.isCore);
    }
    
    return exercises;
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const newExercise: Exercise = { ...exercise, id };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const existing = this.exercises.get(id);
    if (!existing) return undefined;
    
    const updated: Exercise = { ...existing, ...exercise };
    this.exercises.set(id, updated);
    return updated;
  }

  // Reminder methods
  async getReminders(userId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(r => r.userId === userId);
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const newReminder: Reminder = { 
      ...reminder, 
      id,
      createdAt: new Date()
    };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const existing = this.reminders.get(id);
    if (!existing) return undefined;
    
    const updated: Reminder = { ...existing, ...reminder };
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: string): Promise<boolean> {
    return this.reminders.delete(id);
  }

  // Progress tracking methods
  async getProgressEntries(userId: string, limit?: number): Promise<ProgressEntry[]> {
    const entries = Array.from(this.progressEntries.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? entries.slice(0, limit) : entries;
  }

  async createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry> {
    const id = randomUUID();
    const newEntry: ProgressEntry = { 
      ...entry, 
      id,
      createdAt: new Date()
    };
    this.progressEntries.set(id, newEntry);
    return newEntry;
  }

  async getProgressEntry(userId: string, date: string): Promise<ProgressEntry | undefined> {
    return Array.from(this.progressEntries.values())
      .find(e => e.userId === userId && e.date === date);
  }

  async updateProgressEntry(id: string, entry: Partial<InsertProgressEntry>): Promise<ProgressEntry | undefined> {
    const existing = this.progressEntries.get(id);
    if (!existing) return undefined;
    
    const updated: ProgressEntry = { ...existing, ...entry };
    this.progressEntries.set(id, updated);
    return updated;
  }

  // Exercise completion methods
  async createExerciseCompletion(completion: InsertExerciseCompletion): Promise<ExerciseCompletion> {
    const id = randomUUID();
    const newCompletion: ExerciseCompletion = { 
      ...completion, 
      id,
      completedAt: new Date()
    };
    this.exerciseCompletions.set(id, newCompletion);
    return newCompletion;
  }

  async getExerciseCompletions(userId: string, date?: string): Promise<ExerciseCompletion[]> {
    let completions = Array.from(this.exerciseCompletions.values())
      .filter(c => c.userId === userId);
    
    if (date) {
      completions = completions.filter(c => 
        c.completedAt && c.completedAt.toISOString().split('T')[0] === date
      );
    }
    
    return completions.sort((a, b) => 
      (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
    );
  }

  // User profile methods
  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const newProfile: UserProfile = { 
      ...profile, 
      id,
      createdAt: new Date()
    };
    this.userProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existing = this.userProfiles.get(id);
    if (!existing) return undefined;
    
    const updated: UserProfile = { ...existing, ...profile };
    this.userProfiles.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
