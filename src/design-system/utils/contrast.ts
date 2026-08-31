/**
 * Utilidad de Accesibilidad WCAG — Cálculo de contraste para badges, tags y estados
 */
export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#FFFFFF';

  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }

  if (hex.length !== 6) return '#FFFFFF';

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Luminancia relativa según estándar sRGB
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#0f172a' : '#FFFFFF';
}

/**
 * Retorna estilos de badge seguros con alto contraste
 */
export function getTagBadgeStyle(color?: string) {
  const bg = color || '#4f46e5';
  const textColor = getContrastTextColor(bg);
  return {
    backgroundColor: bg,
    color: textColor,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  };
}
