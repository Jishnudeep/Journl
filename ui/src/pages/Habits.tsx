// ========================================
// Journl — Habits Page
// ========================================

import { useState, useMemo } from 'react';
import { Plus, Trash2, Check, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getToday, getWeekDates, getDayOfWeek, formatDateShort } from '../utils/dateUtils';
import { calculateDailyPercentage } from '../utils/consistency';
import { getPercentageRange, getPercentageLabel, type HabitCategory, type DayOfWeek } from '../types';
import { getRandomItem, ENCOURAGEMENTS_PARTIAL } from '../utils/encouragement';

const CATEGORY_EMOJIS: Record<HabitCategory, string> = {
    health: '💚',
    mind: '🧠',
    productivity: '⚡',
    custom: '✨',
};

const HABIT_EMOJIS = ['🧘', '🏋️', '📚', '💧', '🎵', '✍️', '🌅', '🚶', '💤', '🍎', '🧹', '💻'];

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Habits() {
    const { state, dispatch } = useApp();
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [showAddModal, setShowAddModal] = useState(false);
    const [encouragement, setEncouragement] = useState<string | null>(null);

    const today = getToday();
    const weekDates = getWeekDates(selectedDate);
    const dayOfWeek = getDayOfWeek(new Date(selectedDate + 'T00:00:00'));

    // Filter habits scheduled for selected day
    const scheduledHabits = useMemo(() => state.habits.filter(h =>
        h.frequency.includes(dayOfWeek) &&
        h.createdAt.split('T')[0] <= selectedDate
    ), [state.habits, dayOfWeek, selectedDate]);

    const dailyPct = calculateDailyPercentage(state.habits, state.habitLogs, selectedDate);
    const pctRange = getPercentageRange(dailyPct);

    const getHabitLog = (habitId: string) => {
        return state.habitLogs.find(l => l.habitId === habitId && l.date === selectedDate);
    };

    const handleIncrement = (habitId: string, amount: number = 1) => {
        dispatch({ type: 'INCREMENT_HABIT', payload: { habitId, date: selectedDate, amount } });
        setEncouragement(getRandomItem(ENCOURAGEMENTS_PARTIAL));
        setTimeout(() => setEncouragement(null), 3000);
    };

    const handleToggle = (habitId: string) => {
        dispatch({ type: 'TOGGLE_HABIT', payload: { habitId, date: selectedDate } });
        const log = state.habitLogs.find(l => l.habitId === habitId && l.date === selectedDate);
        if (!log || !log.completed) {
            setEncouragement(getRandomItem(ENCOURAGEMENTS_PARTIAL));
            setTimeout(() => setEncouragement(null), 3000);
        }
    };

    const handleDeleteHabit = (habitId: string) => {
        dispatch({ type: 'DELETE_HABIT', payload: habitId });
    };

    return (
        <div className="page-content">
            {/* Left Page: Daily Execution */}
            <div className="ledger-page">
                {/* Week Strip */}
                <div className="week-strip">
                    {weekDates.map(dateStr => {
                        const d = new Date(dateStr + 'T00:00:00');
                        const isToday = dateStr === today;
                        const isSelected = dateStr === selectedDate;
                        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
                        const dayNum = d.getDate();
                        const dayPct = calculateDailyPercentage(state.habits, state.habitLogs, dateStr);

                        return (
                            <div
                                key={dateStr}
                                className={`week-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayPct >= 50 ? 'completed' : ''}`}
                                onClick={() => setSelectedDate(dateStr)}
                            >
                                <span className="day-label">{dayLabel}</span>
                                <span className="day-num">{dayNum}</span>
                                <span className="dot" />
                            </div>
                        );
                    })}
                </div>

                {/* Daily Percentage & Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <h2 className="section-header" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                            {formatDateShort(selectedDate)}
                        </h2>
                        {selectedDate !== today && (
                            <button
                                className="btn-secondary btn-small"
                                onClick={() => setSelectedDate(today)}
                                style={{ padding: '4px 12px', fontSize: '0.85rem', borderRadius: 'var(--radius-xl)' }}
                            >
                                Go to Today
                            </button>
                        )}
                    </div>
                    {scheduledHabits.length > 0 && (
                        <div className={`daily-pct ${pctRange}`}>
                            {dailyPct}% — {getPercentageLabel(pctRange)}
                        </div>
                    )}
                </div>

                {/* Micro-Encouragement Nudge */}
                <div style={{ height: '24px', marginBottom: 'var(--space-md)' }}>
                    {encouragement && (
                        <div className="handwriting fade-in" style={{ color: 'var(--leather)', fontSize: '0.9rem', textAlign: 'center' }}>
                            {encouragement}
                        </div>
                    )}
                </div>

                {/* Habits List for Selected Day */}
                {scheduledHabits.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📝</div>
                        <div className="title">No habits for this day</div>
                        <div className="subtitle">Add a new habit to get started</div>
                    </div>
                ) : (
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        {scheduledHabits.map((habit, index) => {
                            const log = getHabitLog(habit.id);
                            const progress = log ? log.progress : 0;
                            const completed = log ? log.completed : false;
                            const progressPct = (progress / habit.target) * 100;
                            const isLast = index === scheduledHabits.length - 1;

                            return (
                                <div className="habit-item-complex" key={habit.id} style={{ padding: 'var(--space-md) 0', borderBottom: isLast ? 'none' : '1px solid var(--border-color)', position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <button
                                            className={`habit-check ${completed ? 'checked' : ''}`}
                                            onClick={() => habit.target === 1 ? handleToggle(habit.id) : handleIncrement(habit.id, habit.target)}
                                            aria-label={`Mark ${habit.name} as complete`}
                                        >
                                            {completed && <Check size={16} />}
                                        </button>

                                        <div style={{ flex: 1, cursor: habit.target > 1 ? 'pointer' : 'default' }} onClick={() => habit.target > 1 && handleIncrement(habit.id)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div className="habit-name" style={{ textDecoration: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1, transition: 'all 0.3s' }}>
                                                    {habit.name}
                                                </div>
                                                <div className="habit-emoji" style={{ opacity: completed ? 0.5 : 1 }}>{habit.emoji}</div>
                                            </div>

                                            {habit.target > 1 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                                    <div className="progress-bar-bg" style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div className="progress-bar-fill" style={{ width: `${progressPct}%`, height: '100%', background: 'var(--leather)', transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
                                                    </div>
                                                    <span className="handwriting" style={{ fontSize: '0.8rem', minWidth: '45px', textAlign: 'right' }}>
                                                        {progress}/{habit.target} {habit.unit}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {habit.target > 1 && !completed && (
                                            <button
                                                className="btn-link"
                                                onClick={(e) => { e.stopPropagation(); handleIncrement(habit.id); }}
                                                style={{ color: 'var(--leather)', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <PlusCircle size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right Page: Habit Library & Management */}
            <div className="ledger-page">
                {showAddModal ? (
                    <AddHabitForm onClose={() => setShowAddModal(false)} />
                ) : (
                    <>
                        <h2 className="section-header">Habit Library</h2>

                        <div className="card" style={{ background: 'rgba(122, 28, 42, 0.05)', borderColor: 'rgba(122, 28, 42, 0.2)', cursor: 'pointer', marginBottom: 'var(--space-lg)' }} onClick={() => setShowAddModal(true)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', color: 'var(--ribbon)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--ribbon)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <div className="handwriting" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Create a New Habit</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Add a new habit to your routine</div>
                                </div>
                            </div>
                        </div>

                        {state.habits.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">🌱</div>
                                <div className="title">Your library is empty</div>
                                <div className="subtitle">Create habits to build your routine</div>
                            </div>
                        ) : (
                            <div className="card">
                                {state.habits.map((habit, index) => {
                                    const isLast = index === state.habits.length - 1;
                                    return (
                                        <div className="habit-item" key={habit.id} style={{ padding: 'var(--space-md) 0', borderBottom: isLast ? 'none' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <div className="habit-emoji" style={{ fontSize: '1.5rem' }}>{habit.emoji}</div>
                                            <div style={{ flex: 1 }}>
                                                <div className="habit-name">{habit.name}</div>
                                                <div className="handwriting" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {habit.target} {habit.unit} • {habit.frequency.length === 7 ? 'Everyday' : habit.frequency.join(', ')}
                                                </div>
                                            </div>
                                            <button
                                                className="btn-secondary btn-small"
                                                onClick={() => handleDeleteHabit(habit.id)}
                                                aria-label={`Delete ${habit.name}`}
                                                style={{ border: 'none', color: 'var(--text-muted)', padding: '4px', opacity: 0.6 }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// --- Add Habit Form (Inline) ---
function AddHabitForm({ onClose }: { onClose: () => void }) {
    const { dispatch } = useApp();
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('🧘');
    const [category, setCategory] = useState<HabitCategory>('health');
    const [frequency, setFrequency] = useState<DayOfWeek[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    const [target, setTarget] = useState('1');
    const [unit, setUnit] = useState('times');

    const handleSubmit = () => {
        if (!name.trim()) return;
        dispatch({
            type: 'ADD_HABIT',
            payload: {
                name: name.trim(),
                emoji,
                category,
                frequency,
                target: Math.max(1, parseInt(target) || 1),
                unit,
            },
        });
        onClose();
    };

    const toggleDay = (day: DayOfWeek) => {
        setFrequency(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    return (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className="section-header" style={{ borderBottom: 'none', marginBottom: 'var(--space-md)' }}>New Habit</h2>

            {/* Name */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="handwriting" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                    What habit do you want to build?
                </label>
                <input
                    className="input-field"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Morning Meditation"
                    autoFocus
                />
            </div>

            {/* Emoji Picker */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="handwriting" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                    Pick an icon
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    {HABIT_EMOJIS.map(e => (
                        <button
                            key={e}
                            onClick={() => setEmoji(e)}
                            style={{
                                fontSize: '1.5rem',
                                padding: '6px',
                                border: emoji === e ? '2px solid var(--leather)' : '2px solid transparent',
                                borderRadius: 'var(--radius-md)',
                                background: emoji === e ? 'rgba(139, 98, 64, 0.08)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="handwriting" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                    Category
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    {(Object.keys(CATEGORY_EMOJIS) as HabitCategory[]).map(cat => (
                        <button
                            key={cat}
                            className={`tag-pill ${category === cat ? 'selected' : ''}`}
                            onClick={() => setCategory(cat)}
                            style={{ color: category === cat ? 'var(--leather)' : 'var(--text-secondary)', borderColor: category === cat ? 'var(--leather)' : 'var(--border-color)' }}
                        >
                            {CATEGORY_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Frequency */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="handwriting" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                    Which days?
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {ALL_DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                fontFamily: 'var(--font-handwriting)',
                                fontSize: '0.85rem',
                                border: frequency.includes(day) ? '2px solid var(--leather)' : '2px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                background: frequency.includes(day) ? 'var(--leather)' : 'transparent',
                                color: frequency.includes(day) ? 'var(--parchment)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Target */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <div style={{ flex: 1 }}>
                    <label className="handwriting" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                        Target (Goal)
                    </label>
                    <input
                        className="input-field"
                        type="number"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        min="1"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="handwriting" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                        Unit
                    </label>
                    <select
                        className="input-field"
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        style={{ cursor: 'pointer' }}
                    >
                        <option value="times">times</option>
                        <option value="minutes">minutes</option>
                        <option value="glasses">glasses</option>
                        <option value="pages">pages</option>
                        <option value="reps">reps</option>
                        <option value="km">km</option>
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <button className="btn-secondary btn" onClick={onClose} style={{ flex: 1 }}>
                    Discard
                </button>
                <button className="btn" onClick={handleSubmit} style={{ flex: 1 }}>
                    Add to Diary
                </button>
            </div>
        </div>
    );
}