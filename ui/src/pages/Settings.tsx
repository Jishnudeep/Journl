// ========================================
// Journl — Settings Page
// ========================================

import { useApp } from '../context/AppContext';
import type { ThemeMode, DayStatusType } from '../types';
import { getToday } from '../utils/dateUtils';
import { calculateStreak } from '../utils/consistency';

export default function Settings() {
    const { state, dispatch } = useApp();
    const streak = calculateStreak(state.habits, state.habitLogs, state.dayStatuses);

    const handleThemeToggle = () => {
        const next: ThemeMode = state.theme === 'morning' ? 'candlelight' : 'morning';
        dispatch({ type: 'SET_THEME', payload: next });
    };

    const handleNotifToggle = (key: keyof typeof state.notificationSettings) => {
        if (typeof state.notificationSettings[key] === 'boolean') {
            dispatch({
                type: 'UPDATE_NOTIFICATION_SETTINGS',
                payload: { ...state.notificationSettings, [key]: !state.notificationSettings[key] },
            });
        }
    };

    const handleTimeChange = (key: 'morningTime' | 'eveningTime', value: string) => {
        dispatch({
            type: 'UPDATE_NOTIFICATION_SETTINGS',
            payload: { ...state.notificationSettings, [key]: value },
        });
    };

    const handleUseDayCredit = (type: DayStatusType) => {
        const creditKey = type === 'skip' ? 'skip' : type === 'sick' ? 'sick' : 'emergency';
        if (state.credits[creditKey] <= 0) return;

        dispatch({
            type: 'SET_DAY_STATUS',
            payload: { date: getToday(), status: type },
        });
        dispatch({
            type: 'UPDATE_CREDITS',
            payload: { ...state.credits, [creditKey]: state.credits[creditKey] - 1 },
        });
    };

    const todayStatus = state.dayStatuses.find(s => s.date === getToday());

    return (
        <div className="page-content">
            {/* Theme */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>Appearance</h2>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="handwriting" style={{ fontSize: '1.1rem' }}>
                                {state.theme === 'morning' ? '☀️ Morning Pages' : '🕯️ Candlelight'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {state.theme === 'morning' ? 'Bright cream diary' : 'Warm dark ambiance'}
                            </div>
                        </div>
                        <button
                            className={`toggle ${state.theme === 'candlelight' ? 'active' : ''}`}
                            onClick={handleThemeToggle}
                            aria-label="Toggle theme"
                        />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>Reminders</h2>
                <div className="card">
                    {/* Morning Digest */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                        <div style={{ flex: 1 }}>
                            <div className="handwriting" style={{ fontSize: '1.05rem' }}>🌅 Morning Digest</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily habits summary</div>
                        </div>
                        <input
                            type="time"
                            value={state.notificationSettings.morningTime}
                            onChange={e => handleTimeChange('morningTime', e.target.value)}
                            className="input-field"
                            style={{ width: '100px', textAlign: 'center', borderBottom: 'none', fontFamily: 'var(--font-handwriting)' }}
                        />
                        <button
                            className={`toggle ${state.notificationSettings.morningDigest ? 'active' : ''}`}
                            onClick={() => handleNotifToggle('morningDigest')}
                            style={{ marginLeft: 'var(--space-sm)' }}
                        />
                    </div>

                    {/* Evening Reflection */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                        <div style={{ flex: 1 }}>
                            <div className="handwriting" style={{ fontSize: '1.05rem' }}>🌙 Evening Reflection</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Journal reminder</div>
                        </div>
                        <input
                            type="time"
                            value={state.notificationSettings.eveningTime}
                            onChange={e => handleTimeChange('eveningTime', e.target.value)}
                            className="input-field"
                            style={{ width: '100px', textAlign: 'center', borderBottom: 'none', fontFamily: 'var(--font-handwriting)' }}
                        />
                        <button
                            className={`toggle ${state.notificationSettings.eveningReflection ? 'active' : ''}`}
                            onClick={() => handleNotifToggle('eveningReflection')}
                            style={{ marginLeft: 'var(--space-sm)' }}
                        />
                    </div>

                    {/* Bundle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                        <div>
                            <div className="handwriting" style={{ fontSize: '1.05rem' }}>📦 Bundle Notifications</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Group into one alert</div>
                        </div>
                        <button
                            className={`toggle ${state.notificationSettings.bundleNotifications ? 'active' : ''}`}
                            onClick={() => handleNotifToggle('bundleNotifications')}
                        />
                    </div>

                    {/* Nudge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="handwriting" style={{ fontSize: '1.05rem' }}>⚠️ Nudge When At Risk</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alert when streak in danger</div>
                        </div>
                        <button
                            className={`toggle ${state.notificationSettings.nudgeWhenAtRisk ? 'active' : ''}`}
                            onClick={() => handleNotifToggle('nudgeWhenAtRisk')}
                        />
                    </div>
                </div>
            </div>

            {/* Credits */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>My Credits</h2>
                <div className="card">
                    <div style={{ marginBottom: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Credits protect your streak without requiring activity. Use wisely — they reset monthly.
                    </div>

                    {/* Credit display */}
                    <div className="credits-row" style={{ justifyContent: 'space-around', marginBottom: 'var(--space-lg)' }}>
                        {[
                            { key: 'skip' as const, label: 'Skip Days', max: 2, emoji: '⏭️' },
                            { key: 'sick' as const, label: 'Sick Days', max: 2, emoji: '🤒' },
                            { key: 'emergency' as const, label: 'Emergency', max: 1, emoji: '🚨' },
                        ].map(credit => (
                            <div className="credit-item" key={credit.key}>
                                <span style={{ fontSize: '1.4rem' }}>{credit.emoji}</span>
                                <div className="credit-dots">
                                    {Array.from({ length: credit.max }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`credit-dot ${i < state.credits[credit.key] ? 'filled' : 'used'}`}
                                        />
                                    ))}
                                </div>
                                <span className="credit-label">{credit.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Use credit buttons */}
                    {!todayStatus || todayStatus.status === 'normal' ? (
                        <div>
                            <div className="handwriting" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                                Mark today as:
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-small btn-secondary"
                                    onClick={() => handleUseDayCredit('skip')}
                                    disabled={state.credits.skip <= 0}
                                    style={{ opacity: state.credits.skip <= 0 ? 0.4 : 1 }}
                                >
                                    ⏭️ Skip Day
                                </button>
                                <button
                                    className="btn btn-small btn-secondary"
                                    onClick={() => handleUseDayCredit('sick')}
                                    disabled={state.credits.sick <= 0}
                                    style={{ opacity: state.credits.sick <= 0 ? 0.4 : 1 }}
                                >
                                    🤒 Sick Day
                                </button>
                                <button
                                    className="btn btn-small btn-secondary"
                                    onClick={() => handleUseDayCredit('emergency')}
                                    disabled={state.credits.emergency <= 0}
                                    style={{ opacity: state.credits.emergency <= 0 ? 0.4 : 1 }}
                                >
                                    🚨 Emergency
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="handwriting" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                            Today is marked as: <strong style={{ color: 'var(--text-primary)' }}>{todayStatus.status.toUpperCase()}</strong>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>Quick Stats</h2>
                <div className="card">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="cursive" style={{ fontSize: '2rem', color: 'var(--gold)' }}>🔥 {streak}</div>
                            <div className="handwriting" style={{ color: 'var(--text-secondary)' }}>Day Streak</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="cursive" style={{ fontSize: '2rem', color: 'var(--leather)' }}>{state.habits.length}</div>
                            <div className="handwriting" style={{ color: 'var(--text-secondary)' }}>Active Habits</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="cursive" style={{ fontSize: '2rem', color: 'var(--ribbon)' }}>{state.journalEntries.length}</div>
                            <div className="handwriting" style={{ color: 'var(--text-secondary)' }}>Journal Entries</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="cursive" style={{ fontSize: '2rem', color: 'var(--wash-sage-solid)' }}>{state.habitLogs.filter(l => l.completed).length}</div>
                            <div className="handwriting" style={{ color: 'var(--text-secondary)' }}>Habits Completed</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
