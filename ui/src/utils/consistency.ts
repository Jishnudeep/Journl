// ========================================
// Journl — Consistency Score & Streak Calculator
// ========================================

import type { Habit, HabitLog, DayStatus } from '../types';
import { toDateString, getDayOfWeek } from './dateUtils';

/**
 * Calculate consistency score over a rolling window.
 * Score = (sum of daily progress percentages) / totalActiveDays
 */
export function calculateConsistencyScore(
    habits: Habit[],
    logs: HabitLog[],
    dayStatuses: DayStatus[],
    windowDays: number = 30
): number {
    if (habits.length === 0) return 100;

    const today = new Date();
    let totalScore = 0;
    let totalDays = 0;

    for (let i = 0; i < windowDays; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = toDateString(d);
        const dayOfWeek = getDayOfWeek(d);

        // Check if any habit was scheduled for this day
        const scheduledHabits = habits.filter(h =>
            h.frequency.includes(dayOfWeek) &&
            h.createdAt.split('T')[0] <= dateStr
        );

        if (scheduledHabits.length === 0) continue;
        totalDays++;

        // Check day status
        const status = dayStatuses.find(s => s.date === dateStr);
        if (status && status.status !== 'normal') {
            // Partial credit for skip/sick days (50%)
            totalScore += 50;
            continue;
        }

        // Calculate granular daily completion
        totalScore += calculateDailyPercentage(habits, logs, dateStr);
    }

    if (totalDays === 0) return 100;
    return Math.round(totalScore / totalDays);
}

/**
 * Calculate daily completion percentage for a specific date.
 * Returns 0-100 based on granular progress of all scheduled habits.
 */
export function calculateDailyPercentage(
    habits: Habit[],
    logs: HabitLog[],
    date: string
): number {
    const d = new Date(date + 'T00:00:00');
    const dayOfWeek = getDayOfWeek(d);

    const scheduledHabits = habits.filter(h =>
        h.frequency.includes(dayOfWeek) &&
        h.createdAt.split('T')[0] <= date
    );

    if (scheduledHabits.length === 0) return 100;

    const dayLogs = logs.filter(l => l.date === date);

    let totalProgress = 0;
    scheduledHabits.forEach(h => {
        const log = dayLogs.find(l => l.habitId === h.id);
        if (log) {
            totalProgress += (log.progress / h.target);
        }
    });

    return Math.round((totalProgress / scheduledHabits.length) * 100);
}

/**
 * Calculate current streak (consecutive days with ≥50% completion).
 * Skip/sick/emergency days don't break the streak.
 */
export function calculateStreak(
    habits: Habit[],
    logs: HabitLog[],
    dayStatuses: DayStatus[]
): number {
    if (habits.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    // Start checking from yesterday if today isn't yet at 50%
    // but for simplicity we'll just check today downwards.
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = toDateString(d);
        const dayOfWeek = getDayOfWeek(d);

        const scheduledHabits = habits.filter(h =>
            h.frequency.includes(dayOfWeek) &&
            h.createdAt.split('T')[0] <= dateStr
        );

        if (scheduledHabits.length === 0) {
            // If it's today and no habits, check yesterday
            if (i === 0) continue;
            // Otherwise, non-habit days don't break streak
            continue;
        }

        // Skip/sick/emergency days don't break streak
        const status = dayStatuses.find(s => s.date === dateStr);
        if (status && status.status !== 'normal') {
            streak++;
            continue;
        }

        const pct = calculateDailyPercentage(habits, logs, dateStr);
        if (pct >= 50) {
            streak++;
        } else {
            // Only break if it's NOT today. If it's today and < 50%, 
            // we don't break yet, we just don't count it for today.
            if (i === 0) continue;
            break;
        }
    }

    return streak;
}
