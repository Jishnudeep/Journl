// ========================================
// Journl — Dashboard Page
// ========================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getToday, getDayOfWeek } from '../utils/dateUtils';
import { calculateConsistencyScore, calculateDailyPercentage, calculateStreak } from '../utils/consistency';
import { getPercentageRange, getPercentageLabel, MOOD_EMOJIS } from '../types';
import {
    getRandomItem,
    WELCOME_BACK_MESSAGES,
    ENCOURAGEMENTS_ON_COMPLETE,
    getUnlockedMilestones
} from '../utils/encouragement';
import Confetti from '../components/Confetti';
import MilestoneToast from '../components/MilestoneToast';

export default function Dashboard() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const today = getToday();
    const dayOfWeek = getDayOfWeek(new Date());

    const [showConfetti, setShowConfetti] = useState(false);
    const [newMilestone, setNewMilestone] = useState<any>(null);
    const [greeting] = useState(() => getRandomItem(WELCOME_BACK_MESSAGES));

    // Calculate metrics
    const consistencyScore = calculateConsistencyScore(state.habits, state.habitLogs, state.dayStatuses);
    const dailyPct = calculateDailyPercentage(state.habits, state.habitLogs, today);
    const streak = calculateStreak(state.habits, state.habitLogs, state.dayStatuses);
    const pctRange = getPercentageRange(dailyPct);

    // Today's scheduled habits
    const allTodaysHabits = useMemo(() => state.habits.filter(h =>
        h.frequency.includes(dayOfWeek) &&
        h.createdAt.split('T')[0] <= today
    ), [state.habits, dayOfWeek, today]);

    // Focus mode: top 3
    const todaysHabits = state.focusMode ? allTodaysHabits.slice(0, 3) : allTodaysHabits;

    // Latest journal entry
    const latestEntry = state.journalEntries[0]; // Already sorted by date in reducer

    // Time since last entry nudge
    const daysSinceLastEntry = useMemo(() => {
        if (state.journalEntries.length === 0) return null;
        const lastDate = new Date(state.journalEntries[0].date);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }, [state.journalEntries, today]);

    // Ring SVG calculations
    const ringRadius = 60;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - (consistencyScore / 100) * ringCircumference;

    // Check for milestones
    useEffect(() => {
        const stats = {
            totalJournalEntries: state.journalEntries.length,
            totalHabitsCompleted: state.habitLogs.filter(l => l.completed).length,
            currentStreak: streak,
            totalHabits: state.habits.length,
            daysActive: 0 // Placeholder
        };
        const newlyUnlocked = getUnlockedMilestones(stats, state.unlockedMilestones);
        if (newlyUnlocked.length > 0) {
            const m = newlyUnlocked[0];
            dispatch({ type: 'UNLOCK_MILESTONE', payload: m.id });
            setNewMilestone(m);
        }
    }, [state.journalEntries.length, state.habitLogs.length, streak, state.habits.length]);

    const handleToggleHabit = (habitId: string) => {
        const wasCompleted = isHabitCompleted(habitId);
        dispatch({ type: 'TOGGLE_HABIT', payload: { habitId, date: today } });

        // Celebration if 100% complete
        if (!wasCompleted) {
            const completedCount = state.habitLogs.filter(l => l.date === today && l.completed).length + 1;
            if (completedCount === allTodaysHabits.length && allTodaysHabits.length > 0) {
                setShowConfetti(true);
            }
        }
    };

    const isHabitCompleted = (habitId: string) => {
        return state.habitLogs.some(l => l.habitId === habitId && l.date === today && l.completed);
    };

    return (
        <div className="page-content">
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
            {newMilestone && (
                <MilestoneToast
                    milestone={newMilestone}
                    onDismiss={() => setNewMilestone(null)}
                />
            )}

            {/* Left Page (Overview & Habits) */}
            <div className="ledger-page">
                {/* Warm Greeting */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <h1 className="cursive" style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{greeting}</h1>
                    {daysSinceLastEntry !== null && daysSinceLastEntry > 1 && (
                        <div className="handwriting" style={{ color: 'var(--text-secondary)', fontSize: '1rem', opacity: 0.8 }}>
                            {daysSinceLastEntry === 1 ? "It's been a day" : `It's been ${daysSinceLastEntry} days`} since your last reflection. 📖
                        </div>
                    )}
                    {dailyPct === 100 && allTodaysHabits.length > 0 && (
                        <div className="handwriting" style={{ color: 'var(--gold)', fontSize: '1rem' }}>
                            {getRandomItem(ENCOURAGEMENTS_ON_COMPLETE)}
                        </div>
                    )}
                </div>

                {/* Consistency Ring + Streak */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                    <div className="consistency-ring">
                        <svg width="120" height="120" viewBox="0 0 150 150">
                            <circle className="ring-bg" cx="75" cy="75" r={ringRadius} strokeWidth="8" />
                            <circle
                                className="ring-fill"
                                cx="75" cy="75" r={ringRadius}
                                strokeWidth="8"
                                stroke="var(--leather)"
                                strokeDasharray={ringCircumference}
                                strokeDashoffset={ringOffset}
                                transform="rotate(-90 75 75)"
                            />
                            <text className="ring-text" x="75" y="70" textAnchor="middle" fontSize="28">
                                {consistencyScore}%
                            </text>
                            <text className="ring-label" x="75" y="90" textAnchor="middle" fontSize="13">
                                consistency
                            </text>
                        </svg>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <div className="streak-badge">
                            <span className="fire">🔥</span>
                            <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
                        </div>

                        {allTodaysHabits.length > 0 && (
                            <div className={`daily-pct ${pctRange}`}>
                                {dailyPct}% — {getPercentageLabel(pctRange)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Today's Habits */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <div className="section-header" style={{ marginBottom: 0 }}>
                            Today's Habits {state.focusMode && `(First 3)`}
                        </div>
                        <div
                            className={`ink-toggle ${state.focusMode ? 'active' : ''}`}
                            onClick={() => dispatch({ type: 'TOGGLE_FOCUS_MODE' })}
                            title={state.focusMode ? 'Show All Habits' : 'Enter Focus Mode'}
                        >
                            <div className="track">
                                <div className="thumb" />
                            </div>
                            <span className="label">{state.focusMode ? 'Focus On' : 'Focus Mode'}</span>
                        </div>
                    </div>

                    {todaysHabits.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📝</div>
                            <div className="title">No habits yet</div>
                            <div className="subtitle">Tap the Habits tab to add your first habit</div>
                        </div>
                    ) : (
                        <div className="card">
                            {todaysHabits.map(habit => {
                                const completed = isHabitCompleted(habit.id);
                                return (
                                    <div className="habit-item" key={habit.id}>
                                        <button
                                            className={`habit-check ${completed ? 'checked' : ''}`}
                                            onClick={() => handleToggleHabit(habit.id)}
                                            aria-label={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'}`}
                                        >
                                            {completed && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <path d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        <div className="habit-info">
                                            <div className="habit-name" style={{ textDecoration: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1 }}>
                                                {habit.name}
                                            </div>
                                            <div className="habit-target">{habit.target} {habit.unit}</div>
                                        </div>
                                        <div className="habit-emoji">{habit.emoji}</div>
                                    </div>
                                );
                            })}
                            {!state.focusMode && allTodaysHabits.length > 3 && (
                                <div style={{ textAlign: 'center', padding: 'var(--space-sm)', opacity: 0.6 }} className="handwriting">
                                    Focusing on your journey...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Page (Journal & Quick Actions) */}
            <div className="ledger-page">
                {/* Latest Journal Entry */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="section-header">Latest Entry</div>

                    {latestEntry ? (
                        <div className="journal-preview" onClick={() => navigate('/journal')}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                                <span className="preview-mood">{MOOD_EMOJIS[latestEntry.mood]}</span>
                                <div style={{ flex: 1 }}>
                                    <div className="preview-snippet">{latestEntry.content || 'No content'}</div>
                                    <div className="preview-time">{latestEntry.time} · {latestEntry.date}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">📖</div>
                            <div className="title">Your diary awaits</div>
                            <div className="subtitle">Tap the pen to write your first entry</div>
                        </div>
                    )}
                </div>

                {/* FAB - Integrated as a 'Add New' card for spread view consistency */}
                <div className="card" style={{ background: 'rgba(122, 28, 42, 0.05)', borderColor: 'rgba(122, 28, 42, 0.2)', cursor: 'pointer' }} onClick={() => navigate('/journal?new=1')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', color: 'var(--ribbon)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--ribbon)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <PenTool size={20} />
                        </div>
                        <div>
                            <div className="handwriting" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Reflect on Today</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Add a new page to your story</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAB - Fixed (Mobile Only or additional access) */}
            <button className="fab" onClick={() => navigate('/journal?new=1')} aria-label="New journal entry">
                <PenTool />
            </button>
        </div>
    );
}
