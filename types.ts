export enum Gender {
  Male = 'Male',
  Female = 'Female',
  NonBinary = 'Non-Binary',
  PreferNotToSay = 'Prefer not to say'
}

export enum DietType {
  None = 'None/Omnivore',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  Keto = 'Keto',
  Paleo = 'Paleo',
  GlutenFree = 'Gluten Free',
  Mediterranean = 'Mediterranean'
}

export enum ActivityLevel {
  Sedentary = 'Sedentary',
  LightlyActive = 'Lightly Active',
  ModeratelyActive = 'Moderately Active',
  VeryActive = 'Very Active',
  ExtraActive = 'Extra Active'
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isProfileComplete: boolean;
  
  // Health Data
  birthDate?: string; // ISO string YYYY-MM-DD
  gender?: Gender;
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  
  // Habits
  smoker?: boolean;
  drinker?: boolean;
  diet?: DietType;
  exerciseFrequency?: ActivityLevel;
  sleepTime?: string; // HH:MM
  wakeTime?: string; // HH:MM
  
  // Medical/Other
  healthConditions?: string;
  mentalConditions?: string;
  workSchedule?: string; // e.g., "9-5", "Shift work"
  additionalInfo?: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  description: string;
  category: 'exercise' | 'diet' | 'sleep' | 'mental' | 'work';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  durationMinutes: number;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  sourceName: string;
  sourceUrl: string;
  category: string;
}

export interface JournalEntry {
  date: string; // ISO Date YYYY-MM-DD
  completedRoutineIds: string[];
  mood: number; // 1-5
  notes: string;
  waterIntakeCups: number;
  sleepHours: number;
}
