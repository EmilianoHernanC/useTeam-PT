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

// ✨ LIGHT THEME - Brillante pero oscuro (saturado y vibrante)
export const lightTheme: Theme = {
  background: {
    primary: '#FFFFFF',        // Durazno brillante
    secondary: '#FFC067',      // Naranja intenso (base más oscura)
    tertiary: '#FAF0E6',       // Naranja medio brillante
    hover: '#FFA94D',          // Hover naranja cálido
  },
  accent: {
    primary: '#08298d',        // Azul oscuro (botones)
    secondary: '#FF8C1A',      // Naranja quemado brillante
    success: '#0EA472',        // Verde intenso
    warning: '#FFB800',        // Amarillo dorado brillante
    danger: '#E8533F',         // Rojo coral intenso
    info: '#2E7CC4',           // Azul royal
  },
  text: {
    primary: '#1a1a1a',        // Negro puro
    secondary: '#4a4a4a',      // Gris oscuro
    tertiary: '#6a6a6a',       // Gris medio
  },
  border: '#FF9F40',           // Naranja intenso (mismo que cards)
  shadow: 'rgba(255, 140, 26, 0.2)',
};

// 🌙 DARK THEME - Gris oscuro con acentos cálidos
export const darkTheme: Theme = {
  background: {
    primary: '#1a1a1a',        // Gris muy oscuro (casi negro)
    secondary: '#2d2d2d',      // Gris oscuro para cards
    tertiary: '#3a3a3a',       // Gris medio para hover
    hover: '#404040',          // Hover states
  },
  accent: {
    primary: '#FFA726',        // Naranja cálido (principal)
    secondary: '#FFB74D',      // Naranja claro
    success: '#66BB6A',        // Verde suave
    warning: '#FFCA28',        // Amarillo dorado
    danger: '#EF5350',         // Rojo suave
    info: '#42A5F5',           // Azul info
  },
  text: {
    primary: '#F5F5F5',        // Blanco suave
    secondary: '#B0B0B0',      // Gris claro
    tertiary: '#808080',       // Gris medio
  },
  border: '#404040',           // Gris medio
  shadow: 'rgba(0, 0, 0, 0.5)',
};

// Íconos con la nueva paleta
export const columnIcons = [
  { emoji: '📝', color: '#08298d', name: 'note' },      
  { emoji: '⚡', color: '#FFA726', name: 'lightning' }, 
  { emoji: '✅', color: '#10b981', name: 'check' },     
  { emoji: '🎯', color: '#FF6B6B', name: 'target' },    
  { emoji: '💡', color: '#FFCA28', name: 'bulb' },      
  { emoji: '🚀', color: '#42A5F5', name: 'rocket' },    
  { emoji: '🎨', color: '#FFB74D', name: 'palette' },   
  { emoji: '⭐', color: '#FFC051', name: 'star' },      
];

export const userColors = [
  '#08298d', '#FFA726', '#10b981', '#FF6B6B',
  '#42A5F5', '#FFCA28', '#66BB6A', '#EF5350',
];