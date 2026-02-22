# Journl UI 🎨

This directory contains the React-based frontend for the Journl application.

## 🏗️ Technology Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: React Context + `useReducer`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: CSS Transitions + Custom `Confetti` component

## 📖 Key Modules

- `src/context/AppContext.tsx`: The heart of the app, managing global state (habits, journal entries, theme, milestones).
- `src/pages/Habits.tsx`: Implements partial credit tracking and incremental habit progress.
- `src/pages/Journal.tsx`: Features micro-journaling prompts and emoji-only entry logic.
- `src/pages/Dashboard.tsx`: Coordinates focus mode, greetings, and time-blindness nudges.
- `src/utils/consistency.ts`: Handles the granular logic for streaks and consistency scores.

## 💻 Developer Commands

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## 🎨 Design System
The UI uses vanilla CSS variables (`src/index.css`) to maintain a theme-consistent color palette across "Vintage Parchment" and "Midnight Library" modes. Custom handwriting fonts are used for secondary text to enhance the journal feel.
