// ========================================
// Journl — Confetti Animation Component
// ========================================

import { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    rotation: number;
}

const COLORS = [
    '#c9a84c', // gold
    '#8b6240', // leather
    '#a0382e', // wax
    '#8b2232', // ribbon
    '#5c3a21', // dark leather
    '#dfc06a', // light gold
    '#64a05a', // sage
];

export default function Confetti({ onComplete }: { onComplete?: () => void }) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        const confetti: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.5,
            duration: 2 + Math.random() * 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 6 + Math.random() * 8,
            rotation: Math.random() * 360,
        }));
        setPieces(confetti);

        const timer = setTimeout(() => {
            setPieces([]);
            onComplete?.();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (pieces.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1000,
            overflow: 'hidden',
        }}>
            {pieces.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: '-10px',
                        width: `${p.size}px`,
                        height: `${p.size * 0.6}px`,
                        backgroundColor: p.color,
                        borderRadius: '1px',
                        transform: `rotate(${p.rotation}deg)`,
                        animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
                        opacity: 0.9,
                    }}
                />
            ))}
            <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}
