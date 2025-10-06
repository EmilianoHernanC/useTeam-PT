export interface Theme {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    hover: string;
  };
  accent: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  shadow: string;
}

export const lightTheme: Theme = {
  background: {
    primary: '#fafbfc',
    secondary: '#ffffff',
    tertiary: '#f0f4f8',
    hover: '#f8fafc',
  },
  accent: {
    primary: '#6366f1',
    secondary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    tertiary: '#94a3b8',
  },
  border: '#e2e8f0',
  shadow: 'rgba(100, 116, 139, 0.12)',
};

export const darkTheme: Theme = {
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    hover: '#293548',
  },
  accent: {
    primary: '#818cf8',
    secondary: '#c4b5fd',
    success: '#6ee7b7',
    warning: '#fcd34d',
    danger: '#fca5a5',
    info: '#93c5fd',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
  },
  border: '#334155',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Íconos para las columnas con colores
export const columnIcons = [
  { emoji: '📝', color: '#6366f1', name: 'note' },
  { emoji: '⚡', color: '#f59e0b', name: 'lightning' },
  { emoji: '✅', color: '#10b981', name: 'check' },
  { emoji: '🎯', color: '#ef4444', name: 'target' },
  { emoji: '💡', color: '#8b5cf6', name: 'bulb' },
  { emoji: '🚀', color: '#06b6d4', name: 'rocket' },
  { emoji: '🎨', color: '#ec4899', name: 'palette' },
  { emoji: '⭐', color: '#f59e0b', name: 'star' },
];

// Colores para avatares de usuarios
export const userColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#ef4444', '#14b8a6',
];