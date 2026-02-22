// ========================================
// Journl — Milestone Toast Component
// ========================================

import { useEffect, useState } from 'react';
import type { Milestone } from '../utils/encouragement';

interface MilestoneToastProps {
    milestone: Milestone;
    onDismiss: () => void;
}

export default function MilestoneToast({ milestone, onDismiss }: MilestoneToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setVisible(true));

        // Auto-dismiss after 4s
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 400);
        }, 4000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div style={{
            position: 'fixed',
            top: visible ? '24px' : '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 500,
            transition: 'top 0.4s ease-out',
            maxWidth: '90vw',
            width: '400px',
        }}>
            <div
                style={{
                    background: 'var(--parchment, #f5efe0)',
                    border: '2px solid var(--gold, #c9a84c)',
                    borderRadius: 'var(--radius-lg, 16px)',
                    padding: '16px 20px',
                    boxShadow: '0 8px 32px rgba(92, 58, 33, 0.25), 0 0 0 1px rgba(201, 168, 76, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                }}
                onClick={onDismiss}
            >
                <span style={{ fontSize: '2rem' }}>{milestone.emoji}</span>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-cursive, cursive)',
                        fontSize: '1.1rem',
                        color: 'var(--gold, #c9a84c)',
                        fontWeight: 600,
                    }}>
                        Milestone Unlocked!
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-handwriting, cursive)',
                        fontSize: '1rem',
                        color: 'var(--text-primary, #2c1810)',
                    }}>
                        {milestone.label}
                    </div>
                </div>
            </div>
        </div>
    );
}
