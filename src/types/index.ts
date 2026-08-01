export type Channel = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'whatsapp';

export type IdeaStatus = 'idea' | 'script' | 'editing' | 'review' | 'ready';

export const STATUS_CONFIG: Record<IdeaStatus, { label: string; emoji: string; color: string }> = {
  idea: { label: 'Idea', emoji: '💡', color: '#F59E0B' },
  script: { label: 'Guión', emoji: '✍️', color: '#3B82F6' },
  editing: { label: 'Edición', emoji: '🎬', color: '#8B5CF6' },
  review: { label: 'Por Revisar', emoji: '👀', color: '#F97316' },
  ready: { label: 'Listo', emoji: '🚀', color: '#22C55E' },
};

export interface PinnedEvent {
  id: string;
  title: string;
  emoji: string;
  targetDate: Date;
  totalContentGoal: number;
  completedContent: number;
}

export interface Idea {
  id: string;
  text: string;
  channels: Channel[];
  status: IdeaStatus;
  eventId?: string;
  useAI: boolean;
  createdAt: Date;
}
