export interface CategoryMetadata {
  category: string;
  icon_name: string;
  color: string;
  description: string;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: 'movie' | 'tv_show' | 'achievement' | 'activity';
  user_id: string;
  user_email?: string;
  capsule_name?: string;
  capsule_description?: string;
  capsule_theme?: {
    color: string;
    background: string;
    icon: string;
  };
  created_at: string;
  shared_with: string[];
  is_public: boolean;
  unlock_date?: string | null;
  collaborators?: Array<{
    email: string;
    role: 'viewer' | 'contributor';
  }>;
  is_collaborative?: boolean;
  voice_note?: {
    url: string;
    duration: number;
  };
  metadata: {
    rating?: number;
    tags?: string[];
    stickers?: string[];
    attachments?: {
      url: string;
      type: 'image' | 'video' | 'audio';
      name: string;
      path?: string;
    }[];
    location?: string;
    mood?: string;
    weather?: string;
    people?: string[];
    sections?: {
      name: string;
      type: 'text' | 'list' | 'checkbox';
      placeholder?: string;
      content: string | string[];
    }[];
    lockPeriod?: string;
    isAnimated?: boolean;
  };
}

export interface MemoryFormData {
  id?: string;
  title: string;
  content: string;
  category: string;
  date: string;
  location: string;
  mood: string;
  weather?: string;
  people?: string[];
  stickers: string[];
  tags: string[];
  rating?: number;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    blob: Blob;
    url?: string;
    path?: string;
  }>;
  sections?: Array<{
    name: string;
    type: 'text' | 'list' | 'checkbox';
    placeholder?: string;
    content: string | string[];
  }>;
  capsule_name?: string;
  capsule_description?: string;
  voiceNote?: {
    url: string;
    duration: number;
    blob?: Blob;
  };
  metadata?: {
    lockPeriod?: string;
    isAnimated?: boolean;
  };
}

export interface Attachment {
  url: string;
  type: 'image' | 'video' | 'audio';
  name: string;
  path?: string;
  blob?: Blob;
}

export interface TimeCapsule {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  lock_until: string;
  memory_count?: number;
}