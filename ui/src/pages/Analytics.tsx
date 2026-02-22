// ========================================
// Journl — Analytics Page
// ========================================

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { daysAgo, formatDateShort, getDayOfWeek } from '../utils/dateUtils';
import { calculateDailyPercentage } from '../utils/consistency';
import { MOOD_EMOJIS, getPercentageRange } from '../types';

export default function Analytics() {
    const { state } = useApp();

    // --- Mood Data (last 7 days) ---
    const moodData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const dateStr = daysAgo(i);
            const entries = state.journalEntries.filter(e => e.date === dateStr);
            const avgMood = entries.length > 0
                ? entries.reduce((sum, e) => sum + e.mood, 0) / entries.length
                : null;
            data.push({
                date: formatDateShort(dateStr),
                mood: avgMood,
                emoji: avgMood ? MOOD_EMOJIS[Math.round(avgMood) as 1 | 2 | 3 | 4 | 5] : '',
            });
        }
        return data;
    }, [state.journalEntries]);

    // --- Habit Heatmap (last 28 days) ---
    const heatmapData = useMemo(() => {
        const data = [];
        for (let i = 27; i >= 0; i--) {
            const dateStr = daysAgo(i);
            const pct = calculateDailyPercentage(state.habits, state.habitLogs, dateStr);
            const dayOfWeek = getDayOfWeek(new Date(dateStr + 'T00:00:00'));
            const scheduledCount = state.habits.filter(h =>
                h.frequency.includes(dayOfWeek) && h.createdAt.split('T')[0] <= dateStr
            ).length;

            data.push({
                date: dateStr,
                pct,
                hasHabits: scheduledCount > 0,
                label: formatDateShort(dateStr),
            });
        }
        return data;
    }, [state.habits, state.habitLogs]);

    // --- Habit Category Breakdown ---
    const categoryBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        state.habits.forEach(h => {
            counts[h.category] = (counts[h.category] || 0) + 1;
        });
        return Object.entries(counts).map(([cat, count]) => ({
            category: cat.charAt(0).toUpperCase() + cat.slice(1),
            count,
        }));
    }, [state.habits]);

    const totalHabits = state.habits.length;

    // Custom tooltip for mood chart
    const MoodTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; mood: number | null; emoji: string } }> }) => {
        if (active && payload && payload.length && payload[0].payload.mood !== null) {
            const d = payload[0].payload;
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-handwriting)',
                }}>
                    <div>{d.emoji} {d.date}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Mood: {d.mood?.toFixed(1)}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page-content">
            {/* Mood Trends */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>Mood This Week</h2>
                <div className="card">
                    {moodData.some(d => d.mood !== null) ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={moodData}>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontFamily: 'Caveat', fontSize: 13, fill: 'var(--text-secondary)' }}
                                    axisLine={{ stroke: 'var(--border-color)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[1, 5]}
                                    ticks={[1, 2, 3, 4, 5]}
                                    tick={{ fontFamily: 'Caveat', fontSize: 13, fill: 'var(--text-secondary)' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={30}
                                />
                                <Tooltip content={<MoodTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="mood"
                                    stroke="var(--leather)"
                                    strokeWidth={2.5}
                                    dot={{ fill: 'var(--leather)', r: 5, strokeWidth: 0 }}
                                    activeDot={{ r: 7, fill: 'var(--gold)' }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                            <div className="icon">📊</div>
                            <div className="title">No mood data yet</div>
                            <div className="subtitle">Write journal entries with moods to see trends</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Habit Heatmap */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>Habit Heatmap</h2>
                <div className="card">
                    {state.habits.length > 0 ? (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: '4px',
                                marginBottom: 'var(--space-md)',
                            }}>
                                {heatmapData.map((day, i) => {
                                    const range = getPercentageRange(day.pct);
                                    let bg = 'var(--border-color)';
                                    if (day.hasHabits) {
                                        switch (range) {
                                            case 'poor': bg = 'var(--wash-rose)'; break;
                                            case 'needsWork': bg = 'var(--wash-orange)'; break;
                                            case 'good': bg = 'var(--wash-amber)'; break;
                                            case 'great': bg = 'var(--wash-sage)'; break;
                                        }
                                        if (day.pct === 100) bg = 'var(--wash-sage-solid)';
                                    }

                                    return (
                                        <div
                                            key={i}
                                            title={`${day.label}: ${day.pct}%`}
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: 'var(--radius-sm)',
                                                background: bg,
                                                cursor: 'default',
                                                transition: 'transform 0.1s ease',
                                                border: '1px solid var(--border-color)',
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                                <span className="handwriting" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Less</span>
                                {['var(--border-color)', 'var(--wash-rose)', 'var(--wash-amber)', 'var(--wash-sage)', 'var(--wash-sage-solid)'].map((bg, i) => (
                                    <div key={i} style={{ width: 14, height: 14, borderRadius: 2, background: bg, border: '1px solid var(--border-color)' }} />
                                ))}
                                <span className="handwriting" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>More</span>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                            <div className="icon">🗓️</div>
                            <div className="title">No habits tracked yet</div>
                            <div className="subtitle">Add habits to see your consistency heatmap</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Breakdown */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>Habit Categories</h2>
                <div className="card">
                    {categoryBreakdown.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {categoryBreakdown.map(cat => (
                                <div key={cat.category}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span className="handwriting" style={{ fontSize: '1rem' }}>{cat.category}</span>
                                        <span className="handwriting" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            {cat.count} habit{cat.count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: 'var(--border-color)',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(cat.count / totalHabits) * 100}%`,
                                            borderRadius: '4px',
                                            background: 'var(--leather)',
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                            <div className="icon">📋</div>
                            <div className="title">No categories yet</div>
                            <div className="subtitle">Add habits with categories to see the breakdown</div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Summary Placeholder */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)' }}>Weekly Insight</h2>
                <div className="card" style={{ borderLeft: '3px solid var(--gold)', fontStyle: 'italic' }}>
                    <div className="handwriting" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {state.journalEntries.length > 0 || state.habitLogs.length > 0
                            ? `You've written ${state.journalEntries.length} journal ${state.journalEntries.length === 1 ? 'entry' : 'entries'} and completed ${state.habitLogs.filter(l => l.completed).length} habit check-ins. Keep building those pages! ✨`
                            : 'Start journaling and tracking habits to unlock weekly insights here. Your story begins with the first page... 📖'
                        }
                    </div>
                    <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        🤖 AI-powered insights coming soon
                    </div>
                </div>
            </div>
        </div>
    );
}
