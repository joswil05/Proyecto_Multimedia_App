export type Channel = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'whatsapp';

export type IdeaStatus = 'banco' | 'idea' | 'script' | 'editing' | 'review' | 'ready';

export interface StatusConfig {
  label: string;
  icon: string;
  color: string;
}

export const STATUS_CONFIG: Record<IdeaStatus, StatusConfig> = {
  banco: { label: 'Banco de Ideas', icon: 'cube-outline', color: '#6B7280' },
  idea: { label: 'Idea', icon: 'bulb-outline', color: '#F59E0B' },
  script: { label: 'Guión', icon: 'document-text-outline', color: '#3B82F6' },
  editing: { label: 'Edición', icon: 'videocam-outline', color: '#8B5CF6' },
  review: { label: 'Por Revisar', icon: 'eye-outline', color: '#F97316' },
  ready: { label: 'Listo', icon: 'rocket-outline', color: '#22C55E' },
};

export interface PinnedEvent {
  id: string;
  title: string;
  icon: string;
  gradientColors: [string, string];
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
  scheduledDate?: Date;
  copyText?: string;
  aiHooks?: string[];
  scriptText?: string;
  productionLinks?: {
    capcut?: string;
    drive?: string;
    audio?: string;
  };
  checklist?: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  assignedTo?: string;
  reviewStatus?: 'evaluacion' | 'ajustes' | 'aprobada' | 'archivada';
  meetingNotes?: string;
  priority?: 'alta' | 'media' | 'baja';
  complexity?: 'rapida' | 'media' | 'compleja';
  isArchived?: boolean;
  notifyPrior?: boolean;
  publishNotificationId?: string;
  reminderNotificationId?: string;
}
