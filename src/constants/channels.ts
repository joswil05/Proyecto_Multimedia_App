import { Channel } from '../types';

export interface ChannelConfig {
  key: Channel;
  label: string;
  color: string;
  icon: string;
}

export const CHANNELS: ChannelConfig[] = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C', icon: 'logo-instagram' },
  { key: 'tiktok', label: 'TikTok', color: '#00F2EA', icon: 'logo-tiktok' },
  { key: 'facebook', label: 'Facebook', color: '#1877F2', icon: 'logo-facebook' },
  { key: 'youtube', label: 'YouTube', color: '#FF0000', icon: 'logo-youtube' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', icon: 'logo-whatsapp' },
];

export const getChannelConfig = (key: Channel): ChannelConfig => {
  return CHANNELS.find((c) => c.key === key)!;
};
