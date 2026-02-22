// ========================================
// Journl — App Header
// ========================================

import { getGreeting, formatDateDisplay, getToday } from '../../utils/dateUtils';

export default function Header() {
    return (
        <header className="app-header">
            <div className="greeting cursive">{getGreeting()}, Jishnudeep</div>
            <div className="date-display">{formatDateDisplay(getToday())}</div>
        </header>
    );
}
