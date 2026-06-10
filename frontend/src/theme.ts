export const theme = {
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceAlt: '#334155',
    primary: '#38bdf8',
    primaryText: '#082f49',
    text: '#f8fafc',
    muted: '#94a3b8',
    danger: '#f87171',
    border: '#334155',
  },
  spacing: (n: number) => n * 8,
  radius: 16,
} as const;
