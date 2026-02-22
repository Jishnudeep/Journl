// ========================================
// Journl — Bottom Tab Navigation
// ========================================

import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, BarChart3, Settings } from 'lucide-react';

const tabs = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/habits', label: 'Habits', icon: CheckSquare },
    { path: '/analytics', label: 'Insights', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
            {tabs.map(tab => {
                const isActive = location.pathname === tab.path;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.path}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                        aria-label={tab.label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <Icon />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
