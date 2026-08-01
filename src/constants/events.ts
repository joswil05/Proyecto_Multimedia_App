export interface EventGradient {
  id: string;
  label: string;
  colors: [string, string];
}

export const EVENT_GRADIENTS: EventGradient[] = [
  { id: 'violet', label: 'Violeta', colors: ['#8B5CF6', '#3B82F6'] },
  { id: 'rose', label: 'Rosa', colors: ['#EC4899', '#F43F5E'] },
  { id: 'emerald', label: 'Esmeralda', colors: ['#10B981', '#059669'] },
  { id: 'amber', label: 'Ámbar', colors: ['#F59E0B', '#EF4444'] },
  { id: 'cyan', label: 'Cyan', colors: ['#06B6D4', '#3B82F6'] },
  { id: 'indigo', label: 'Índigo', colors: ['#6366F1', '#8B5CF6'] },
];

export const EVENT_ICONS: string[] = [
  'flag-outline',
  'calendar-outline',
  'star-outline',
  'trophy-outline',
  'heart-outline',
  'flame-outline',
  'megaphone-outline',
  'musical-notes-outline',
];
