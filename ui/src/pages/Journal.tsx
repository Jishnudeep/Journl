// ========================================
// Journl — Journal Page
// ========================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trash2, Plus, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getToday, formatDateDisplay } from '../utils/dateUtils';
import { MOOD_EMOJIS, MOOD_LABELS, type MoodLevel } from '../types';
import { JOURNAL_PROMPTS, getRandomItem } from '../utils/encouragement';

export default function Journal() {
    const { state, dispatch } = useApp();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showNewEntry, setShowNewEntry] = useState(!!searchParams.get('new'));
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

    // New entry form state
    const [mood, setMood] = useState<MoodLevel>(3);
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);
    const [prompt, setPrompt] = useState(() => getRandomItem(JOURNAL_PROMPTS));

    useEffect(() => {
        if (searchParams.get('new')) {
            setShowNewEntry(true);
            setPrompt(getRandomItem(JOURNAL_PROMPTS));
        }
    }, [searchParams]);

    const handleSave = () => {
        // ADHD Friendly: Allow sealing with just a mood (emoji-only entry)
        dispatch({
            type: 'ADD_JOURNAL_ENTRY',
            payload: { mood, content: content.trim(), tags: selectedTags },
        });
        // Reset
        setMood(3);
        setContent('');
        setSelectedTags([]);
        setShowNewEntry(false);
        navigate('/journal', { replace: true });
    };

    const handleDelete = (id: string) => {
        dispatch({ type: 'DELETE_JOURNAL_ENTRY', payload: id });
        setExpandedEntry(null);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleAddTag = () => {
        if (newTag.trim()) {
            dispatch({ type: 'ADD_TAG', payload: newTag.trim().toLowerCase() });
            setSelectedTags(prev => [...prev, newTag.trim().toLowerCase()]);
            setNewTag('');
            setShowTagInput(false);
        }
    };

    const handleRefreshPrompt = () => {
        setPrompt(getRandomItem(JOURNAL_PROMPTS));
    };

    // Group entries by date
    const entriesByDate = useMemo(() => state.journalEntries.reduce<Record<string, typeof state.journalEntries>>((acc, entry) => {
        if (!acc[entry.date]) acc[entry.date] = [];
        acc[entry.date].push(entry);
        return acc;
    }, {}), [state.journalEntries]);

    const sortedDates = useMemo(() => Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a)), [entriesByDate]);

    return (
        <div className="page-content">
            {/* New Entry Section */}
            {showNewEntry ? (
                <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 className="section-header" style={{ fontFamily: 'var(--font-cursive)', marginBottom: '4px' }}>
                                {formatDateDisplay(getToday())}
                            </h2>
                            <div className="handwriting" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {prompt}
                                <button
                                    className="btn-link"
                                    onClick={handleRefreshPrompt}
                                    style={{ color: 'var(--text-muted)' }}
                                    title="Try another prompt"
                                >
                                    <RefreshCw size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mood Selector */}
                    <div className="mood-selector">
                        {([1, 2, 3, 4, 5] as MoodLevel[]).map(level => (
                            <button
                                key={level}
                                className={`mood-option ${mood === level ? 'selected' : ''}`}
                                onClick={() => setMood(level)}
                                aria-label={MOOD_LABELS[level]}
                            >
                                <span className="emoji">{MOOD_EMOJIS[level]}</span>
                                <span className="label">{MOOD_LABELS[level]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Text Area */}
                    <textarea
                        className="textarea-field"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Type here, or just seal it with your mood..."
                        autoFocus
                        style={{ minHeight: '150px' }}
                    />

                    {/* Tags */}
                    <div style={{ marginTop: 'var(--space-md)' }}>
                        <label className="handwriting" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                            Wax Seals (Tags)
                        </label>
                        <div className="tag-pills">
                            {state.tags.map(tag => (
                                <button
                                    key={tag}
                                    className={`tag-pill ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}

                            {showTagInput ? (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <input
                                        className="input-field"
                                        type="text"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                        placeholder="new tag..."
                                        style={{ width: '100px', fontSize: '0.9rem', padding: '4px 8px' }}
                                        autoFocus
                                    />
                                    <button className="btn btn-small" onClick={handleAddTag}>+</button>
                                </div>
                            ) : (
                                <button className="tag-pill add-tag" onClick={() => setShowTagInput(true)}>
                                    <Plus size={14} /> Add
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                        <button className="btn btn-secondary" onClick={() => { setShowNewEntry(false); navigate('/journal', { replace: true }); }} style={{ flex: 1 }}>
                            Discard
                        </button>
                        <button className="btn" onClick={handleSave} style={{ flex: 1 }}>
                            ✒️ {content.trim() ? 'Seal Entry' : 'Seal with Mood'}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className="btn"
                    onClick={() => setShowNewEntry(true)}
                    style={{ width: '100%', marginBottom: 'var(--space-xl)' }}
                >
                    <Plus size={18} /> Write a New Page
                </button>
            )}

            {/* Past Entries */}
            {sortedDates.length === 0 && !showNewEntry ? (
                <div className="empty-state">
                    <div className="icon">📖</div>
                    <div className="title">Your diary awaits</div>
                    <div className="subtitle">Write your first entry to begin your journey</div>
                </div>
            ) : (
                sortedDates.map(date => (
                    <div key={date} style={{ marginBottom: 'var(--space-lg)' }}>
                        <h3 className="handwriting" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', fontSize: '1.1rem' }}>
                            {formatDateDisplay(date)}
                        </h3>
                        {entriesByDate[date].map(entry => {
                            const isExpanded = expandedEntry === entry.id;
                            return (
                                <div
                                    key={entry.id}
                                    className="journal-preview"
                                    style={{ marginBottom: 'var(--space-sm)', cursor: 'pointer' }}
                                    onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                                        <span className="preview-mood">{MOOD_EMOJIS[entry.mood]}</span>
                                        <div style={{ flex: 1 }}>
                                            {isExpanded ? (
                                                <>
                                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                                        {entry.content || <em style={{ opacity: 0.5 }}>Emoji-only entry</em>}
                                                    </p>
                                                    {entry.tags.length > 0 && (
                                                        <div className="tag-pills" style={{ marginTop: 'var(--space-sm)' }}>
                                                            {entry.tags.map(t => (
                                                                <span key={t} className="tag-pill" style={{ cursor: 'default' }}>{t}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="preview-snippet">
                                                    {entry.content || <em style={{ opacity: 0.5 }}>Mood logged</em>}
                                                </div>
                                            )}
                                            <div className="preview-time" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-xs)' }}>
                                                <span>{entry.time}</span>
                                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                                    {isExpanded && (
                                                        <button
                                                            className="btn-small btn-secondary"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                                            style={{ border: 'none', color: 'var(--wax-red)', padding: '2px' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))
            )}
        </div>
    );
}
