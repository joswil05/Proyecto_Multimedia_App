import { ContentPillar } from '../types';

export interface PillarConfig {
  label: string;
  icon: any;
  color: string;
}

export const PILLARS_CONFIG: Record<ContentPillar, PillarConfig> = {
  educativo: { label: 'Educativo', icon: 'school-outline', color: '#3B82F6' }, // Azul
  entretenimiento: { label: 'Entretenimiento', icon: 'sparkles-outline', color: '#EC4899' }, // Rosa
  inspiracional: { label: 'Inspiracional', icon: 'bulb-outline', color: '#8B5CF6' }, // Púrpura
  promocional: { label: 'Promocional', icon: 'megaphone-outline', color: '#EF4444' }, // Rojo
  comunidad: { label: 'Comunidad', icon: 'people-outline', color: '#22C55E' }, // Verde
};
