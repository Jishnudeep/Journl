// ========================================
// Journl — Global State Provider
// ========================================

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
    AppState, JournalEntry, Habit, HabitLog,
    DayStatus, DayStatusType, Credits, ThemeMode,
    NotificationSettings, MoodLevel,
} from '../types';
import { DEFAULT_CREDITS, DEFAULT_NOTIFICATION_SETTINGS } from '../types';
import { loadState, saveState } from '../utils/storage';
import { getToday } from '../utils/dateUtils';

// --- Initial State ---
const initialState: AppState = {
    theme: 'morning',
    journalEntries: loadState('journalEntries', []),
    habits: loadState('habits', []),
    habitLogs: loadState('habitLogs', []),
    dayStatuses: loadState('dayStatuses', []),
    credits: loadState('credits', DEFAULT_CREDITS),
    notificationSettings: loadState('notificationSettings', DEFAULT_NOTIFICATION_SETTINGS),
    tags: loadState('tags', ['grateful', 'reflection', 'personal', 'work', 'health']),
    unlockedMilestones: loadState('unlockedMilestones', []),
    focusMode: loadState('focusMode', false),
};

// Load theme
const savedTheme = loadState<ThemeMode>('theme', 'morning');
initialState.theme = savedTheme;

// --- Actions ---
type Action =
    | { type: 'SET_THEME'; payload: ThemeMode }
    | { type: 'ADD_JOURNAL_ENTRY'; payload: { mood: MoodLevel; content: string; tags: string[] } }
    | { type: 'UPDATE_JOURNAL_ENTRY'; payload: JournalEntry }
    | { type: 'DELETE_JOURNAL_ENTRY'; payload: string }
    | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id' | 'createdAt'> }
    | { type: 'UPDATE_HABIT'; payload: Habit }
    | { type: 'DELETE_HABIT'; payload: string }
    | { type: 'TOGGLE_HABIT'; payload: { habitId: string; date: string } }
    | { type: 'SET_DAY_STATUS'; payload: { date: string; status: DayStatusType } }
    | { type: 'UPDATE_CREDITS'; payload: Credits }
    | { type: 'UPDATE_NOTIFICATION_SETTINGS'; payload: NotificationSettings }
    | { type: 'ADD_TAG'; payload: string }
    | { type: 'REMOVE_TAG'; payload: string }
    | { type: 'UNLOCK_MILESTONE'; payload: string }
    | { type: 'TOGGLE_FOCUS_MODE' }
    | { type: 'INCREMENT_HABIT'; payload: { habitId: string; date: string; amount: number } };

// --- Reducer ---
function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.payload };

        case 'ADD_JOURNAL_ENTRY': {
            const now = new Date();
            const entry: JournalEntry = {
                id: uuidv4(),
                date: getToday(),
                time: now.toTimeString().slice(0, 5),
                createdAt: now.toISOString(),
                mood: action.payload.mood,
                content: action.payload.content,
                tags: action.payload.tags,
            };
            return { ...state, journalEntries: [entry, ...state.journalEntries] };
        }

        case 'UPDATE_JOURNAL_ENTRY':
            return {
                ...state,
                journalEntries: state.journalEntries.map(e =>
                    e.id === action.payload.id ? action.payload : e
                ),
            };

        case 'DELETE_JOURNAL_ENTRY':
            return {
                ...state,
                journalEntries: state.journalEntries.filter(e => e.id !== action.payload),
            };

        case 'ADD_HABIT': {
            const habit: Habit = {
                ...action.payload,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
            };
            return { ...state, habits: [...state.habits, habit] };
        }

        case 'UPDATE_HABIT':
            return {
                ...state,
                habits: state.habits.map(h =>
                    h.id === action.payload.id ? action.payload : h
                ),
            };

        case 'DELETE_HABIT':
            return {
                ...state,
                habits: state.habits.filter(h => h.id !== action.payload),
                habitLogs: state.habitLogs.filter(l => l.habitId !== action.payload),
            };

        case 'TOGGLE_HABIT': {
            const { habitId, date } = action.payload;
            const existing = state.habitLogs.find(
                l => l.habitId === habitId && l.date === date
            );
            if (existing) {
                // Toggle off
                return {
                    ...state,
                    habitLogs: state.habitLogs.map(l =>
                        l.id === existing.id
                            ? { ...l, completed: !l.completed, progress: l.completed ? 0 : 1 }
                            : l
                    ),
                };
            } else {
                // Toggle on
                const log: HabitLog = {
                    id: uuidv4(),
                    habitId,
                    date,
                    completed: true,
                    progress: 1,
                };
                return { ...state, habitLogs: [...state.habitLogs, log] };
            }
        }

        case 'SET_DAY_STATUS': {
            const { date, status } = action.payload;
            const existing = state.dayStatuses.findIndex(s => s.date === date);
            let newStatuses: DayStatus[];
            if (existing >= 0) {
                newStatuses = [...state.dayStatuses];
                newStatuses[existing] = { date, status };
            } else {
                newStatuses = [...state.dayStatuses, { date, status }];
            }
            return { ...state, dayStatuses: newStatuses };
        }

        case 'UPDATE_CREDITS':
            return { ...state, credits: action.payload };

        case 'UPDATE_NOTIFICATION_SETTINGS':
            return { ...state, notificationSettings: action.payload };

        case 'ADD_TAG':
            if (state.tags.includes(action.payload)) return state;
            return { ...state, tags: [...state.tags, action.payload] };

        case 'REMOVE_TAG':
            return { ...state, tags: state.tags.filter(t => t !== action.payload) };

        case 'UNLOCK_MILESTONE':
            if (state.unlockedMilestones.includes(action.payload)) return state;
            return { ...state, unlockedMilestones: [...state.unlockedMilestones, action.payload] };

        case 'TOGGLE_FOCUS_MODE':
            return { ...state, focusMode: !state.focusMode };

        case 'INCREMENT_HABIT': {
            const { habitId, date, amount } = action.payload;
            const habit = state.habits.find(h => h.id === habitId);
            if (!habit) return state;

            const existingIndex = state.habitLogs.findIndex(
                l => l.habitId === habitId && l.date === date
            );

            if (existingIndex >= 0) {
                const log = state.habitLogs[existingIndex];
                const newProgress = Math.min(habit.target, log.progress + amount);
                const updatedLog = {
                    ...log,
                    progress: newProgress,
                    completed: newProgress >= habit.target
                };
                const newLogs = [...state.habitLogs];
                newLogs[existingIndex] = updatedLog;
                return { ...state, habitLogs: newLogs };
            } else {
                const log: HabitLog = {
                    id: uuidv4(),
                    habitId,
                    date,
                    progress: Math.min(habit.target, amount),
                    completed: amount >= habit.target
                };
                return { ...state, habitLogs: [...state.habitLogs, log] };
            }
        }

        default:
            return state;
    }
}

// --- Context ---
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Persist to localStorage
    useEffect(() => {
        saveState('journalEntries', state.journalEntries);
    }, [state.journalEntries]);

    useEffect(() => {
        saveState('habits', state.habits);
    }, [state.habits]);

    useEffect(() => {
        saveState('habitLogs', state.habitLogs);
    }, [state.habitLogs]);

    useEffect(() => {
        saveState('dayStatuses', state.dayStatuses);
    }, [state.dayStatuses]);

    useEffect(() => {
        saveState('credits', state.credits);
    }, [state.credits]);

    useEffect(() => {
        saveState('notificationSettings', state.notificationSettings);
    }, [state.notificationSettings]);

    useEffect(() => {
        saveState('tags', state.tags);
    }, [state.tags]);

    useEffect(() => {
        saveState('theme', state.theme);
        document.documentElement.setAttribute('data-theme', state.theme === 'candlelight' ? 'candlelight' : '');
    }, [state.theme]);

    useEffect(() => {
        saveState('unlockedMilestones', state.unlockedMilestones);
    }, [state.unlockedMilestones]);

    useEffect(() => {
        saveState('focusMode', state.focusMode);
    }, [state.focusMode]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
