// ========================================
// Journl — Date utilities
// ========================================

import type { DayOfWeek } from '../types';

const DAY_NAMES: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as unknown as DayOfWeek[];
const DAY_MAP: Record<number, DayOfWeek> = {
    0: 'Sun' as DayOfWeek,
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
};

export function toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function toTimeString(date: Date): string {
    return date.toTimeString().slice(0, 5);
}

export function getToday(): string {
    return toDateString(new Date());
}

export function getDayOfWeek(date: Date): DayOfWeek {
    return DAY_MAP[date.getDay()];
}

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export function formatDateDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateShort(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export function getWeekDates(centerDate?: string): string[] {
    const center = centerDate ? new Date(centerDate + 'T00:00:00') : new Date();
    const dayOfWeek = center.getDay();
    const monday = new Date(center);
    monday.setDate(center.getDate() - ((dayOfWeek + 6) % 7));

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(toDateString(d));
    }
    return dates;
}

export function getDaysInRange(startDate: string, endDate: string): string[] {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
        dates.push(toDateString(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

export function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toDateString(d);
}

export { DAY_NAMES };
