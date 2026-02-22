// ========================================
// Journl — Encouragement Messages & Milestones
// ========================================

// --- Zero-guilt language, warm & ADHD-friendly ---

export const ENCOURAGEMENTS_ON_COMPLETE = [
    "You did it! Every small step fills a page in your story ✨",
    "Look at you go! Your diary is proud of you 📖",
    "Another day, another page written. Beautiful 🖋️",
    "You showed up today, and that's what matters most 🌟",
    "Consistency isn't perfection — it's showing up. You nailed it 💛",
    "Your future self will thank you for this page 📜",
    "Small wins stack up. You're building something wonderful 🧱",
    "That ink is drying on another great day 🖊️",
    "One more day of proof that you can do hard things 🔥",
    "The best habit is the one you actually do. Well done 💪",
];

export const ENCOURAGEMENTS_PARTIAL = [
    "Some progress is still progress — proud of you 🌱",
    "Even a few drops of ink fill the page over time ✒️",
    "Did a little? That still counts. Always 💛",
    "Partial credit is full credit in this diary 📖",
    "Starting is the hardest part, and you started 🌅",
    "Not every page needs to be full — some are beautiful with just a few words ✨",
    "You moved the needle today. That matters 📈",
    "A shorter walk is still a walk. A shorter read is still a read 🚶📚",
];

export const WELCOME_BACK_MESSAGES = [
    "Welcome back! Your diary missed you 📖",
    "Hey! Ready to pick up where you left off? ✨",
    "Good to see you! No guilt here — just fresh pages waiting 🌿",
    "You're here, and that's the first win of the day 🌟",
    "Welcome back to your cozy corner 🕯️",
    "Fresh page, fresh start. Let's go 📝",
];

export const JOURNAL_PROMPTS = [
    "One thing I'm grateful for today...",
    "The best moment of my day was...",
    "Right now I'm feeling...",
    "Something that made me smile today...",
    "One thing I want to remember about today...",
    "I'm proud of myself for...",
    "If I could describe today in one word...",
    "Something I learned today...",
    "A small win I had today...",
    "What I need to hear right now is...",
    "The highlight of my day...",
    "Something I'm looking forward to...",
];

export function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- Milestones ---

export interface Milestone {
    id: string;
    label: string;
    emoji: string;
    check: (stats: MilestoneStats) => boolean;
}

export interface MilestoneStats {
    totalJournalEntries: number;
    totalHabitsCompleted: number;
    currentStreak: number;
    totalHabits: number;
    daysActive: number;
}

export const MILESTONES: Milestone[] = [
    { id: 'first_entry', label: 'First Page Written', emoji: '📝', check: s => s.totalJournalEntries >= 1 },
    { id: 'first_habit', label: 'First Habit Created', emoji: '🌱', check: s => s.totalHabits >= 1 },
    { id: 'first_check', label: 'First Habit Checked', emoji: '✅', check: s => s.totalHabitsCompleted >= 1 },
    { id: '5_entries', label: '5 Journal Entries', emoji: '📖', check: s => s.totalJournalEntries >= 5 },
    { id: '10_entries', label: '10 Journal Entries', emoji: '📚', check: s => s.totalJournalEntries >= 10 },
    { id: '25_entries', label: '25 Pages Filled', emoji: '📕', check: s => s.totalJournalEntries >= 25 },
    { id: '10_habits', label: '10 Habits Completed', emoji: '💪', check: s => s.totalHabitsCompleted >= 10 },
    { id: '25_habits', label: '25 Habits Completed', emoji: '⭐', check: s => s.totalHabitsCompleted >= 25 },
    { id: '50_habits', label: '50 Habits Completed', emoji: '🏆', check: s => s.totalHabitsCompleted >= 50 },
    { id: '100_habits', label: '100 Habits Completed', emoji: '👑', check: s => s.totalHabitsCompleted >= 100 },
    { id: 'streak_3', label: '3-Day Streak', emoji: '🔥', check: s => s.currentStreak >= 3 },
    { id: 'streak_7', label: 'One Week Streak', emoji: '🔥🔥', check: s => s.currentStreak >= 7 },
    { id: 'streak_14', label: 'Two Week Streak', emoji: '💫', check: s => s.currentStreak >= 14 },
    { id: 'streak_30', label: 'One Month Streak', emoji: '🌟', check: s => s.currentStreak >= 30 },
    { id: '5_habits_created', label: '5 Habits Tracked', emoji: '📋', check: s => s.totalHabits >= 5 },
];

export function getUnlockedMilestones(stats: MilestoneStats, previouslyUnlocked: string[]): Milestone[] {
    return MILESTONES.filter(m => m.check(stats) && !previouslyUnlocked.includes(m.id));
}

export function getAllUnlockedMilestones(stats: MilestoneStats): Milestone[] {
    return MILESTONES.filter(m => m.check(stats));
}
