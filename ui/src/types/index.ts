// ========================================
// Journl — Type Definitions
// ========================================

// --- Mood ---
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export const MOOD_LABELS: Record<MoodLevel, string> = {
    1: 'Terrible',
    2: 'Bad',
    3: 'Okay',
    4: 'Good',
    5: 'Great',
};
export const MOOD_EMOJIS: Record<MoodLevel, string> = {
    1: '😞',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😊',
};

// --- Journal ---
export interface JournalEntry {
    id: string;
    date: string;       // ISO date string YYYY-MM-DD
    time: string;       // HH:MM
    createdAt: string;   // full ISO datetime
    mood: MoodLevel;
    content: string;
    tags: string[];
}

// --- Habits ---
export type HabitCategory = 'health' | 'mind' | 'productivity' | 'custom';
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    category: HabitCategory;
    frequency: DayOfWeek[];     // which days
    target: number;             // e.g., 30 (minutes), 8 (glasses)
    unit: string;               // e.g., 'minutes', 'glasses', 'pages'
    reminderTime?: string;      // HH:MM or undefined
    createdAt: string;
}

export interface HabitLog {
    id: string;
    habitId: string;
    date: string;               // YYYY-MM-DD
    completed: boolean;
    progress: number;           // partial progress toward target
}

// --- Day Status ---
export type DayStatusType = 'normal' | 'skip' | 'sick' | 'emergency';

export interface DayStatus {
    date: string;
    status: DayStatusType;
}

// --- Credits ---
export interface Credits {
    skip: number;
    sick: number;
    emergency: number;
    monthReset: string;         // YYYY-MM of last reset
}

export const DEFAULT_CREDITS: Credits = {
    skip: 2,
    sick: 2,
    emergency: 1,
    monthReset: '',
};

// --- Notifications / Settings ---
export interface NotificationSettings {
    morningDigest: boolean;
    morningTime: string;        // HH:MM
    eveningReflection: boolean;
    eveningTime: string;
    bundleNotifications: boolean;
    nudgeWhenAtRisk: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    morningDigest: true,
    morningTime: '08:00',
    eveningReflection: true,
    eveningTime: '21:00',
    bundleNotifications: true,
    nudgeWhenAtRisk: true,
};

// --- App State ---
export type ThemeMode = 'morning' | 'candlelight';

export interface AppState {
    theme: ThemeMode;
    journalEntries: JournalEntry[];
    habits: Habit[];
    habitLogs: HabitLog[];
    dayStatuses: DayStatus[];
    credits: Credits;
    notificationSettings: NotificationSettings;
    tags: string[];             // available tags
    unlockedMilestones: string[];
    focusMode: boolean;
}

// --- Percentage Ranges ---
export type PercentageRange = 'poor' | 'needsWork' | 'good' | 'great';

export function getPercentageRange(pct: number): PercentageRange {
    if (pct < 20) return 'poor';
    if (pct < 50) return 'needsWork';
    if (pct < 80) return 'good';
    return 'great';
}

export function getPercentageLabel(range: PercentageRange): string {
    switch (range) {
        case 'poor': return 'Poor';
        case 'needsWork': return 'Needs Work';
        case 'good': return 'Good';
        case 'great': return 'Great';
    }
}
