# Look Back Application Documentation

## Overview
Look Back is a digital memory preservation platform that allows users to create, store, and share memories through various formats including text, images, audio, and time capsules.

## Backend Architecture (Supabase)

### Database Schema

#### Core Tables
- `memories`
  - Primary storage for user memories
  - Supports rich content (text, images, audio)
  - Includes time capsule functionality
  - Fields:
    ```sql
    id: uuid (PK)
    user_id: uuid (FK to auth.users)
    title: text
    content: text
    category: memory_category (enum)
    metadata: jsonb
    created_at: timestamptz
    unlock_date: timestamptz
    shared_with: text[]
    is_public: boolean
    collaborators: jsonb
    ```

- `profiles`
  - User profile information
  - Fields:
    ```sql
    id: uuid (PK, FK to auth.users)
    full_name: text
    avatar_url: text
    bio: text
    location: text
    website: text
    created_at: timestamptz
    updated_at: timestamptz
    ```

- `journal_entries`
  - Personal journal functionality
  - Fields:
    ```sql
    id: uuid (PK)
    user_id: uuid (FK to profiles)
    content: text
    mood: text
    tags: text[]
    is_private: boolean
    unlock_date: timestamptz
    voice_note_url: text
    metadata: jsonb
    entry_date: date
    ```

#### Supporting Tables
- `achievements`: Gamification system
- `user_achievements`: User progress tracking
- `notification_preferences`: User notification settings
- `user_stats`: User activity metrics
- `yearly_highlights`: Annual memory compilations
- `category_metadata`: Memory categorization system
- `legacy_access`: Digital inheritance system

### Authentication
- Implemented using Supabase Auth
- Email/password authentication
- JWT-based session management
- Row Level Security (RLS) policies for data access control

### Storage
- Supabase Storage for media files
- Buckets:
  - `profiles`: Avatar images
  - `voice-notes`: Audio recordings
  - `attachments`: Memory attachments

### API Endpoints
All interactions handled through Supabase client library:

```typescript
// Authentication
signUp(email: string, password: string)
signIn(email: string, password: string)
signOut()

// Memories
createMemory(data: MemoryData)
updateMemory(id: string, data: MemoryData)
deleteMemory(id: string)
getMemories()
getMemoryById(id: string)

// Time Capsules
createTimeCapsule(data: TimeCapsuleData)
unlockTimeCapsule(id: string)
getTimeCapsules()

// Journal
createJournalEntry(data: JournalData)
updateJournalEntry(id: string, data: JournalData)
deleteJournalEntry(id: string)
getJournalEntries()
```

## Frontend Architecture

### Technology Stack
- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.2
- TailwindCSS 3.4.1
- Lucide React for icons

### Key Components
- `MemoryForm`: Memory creation/editing
- `ExportCapsule`: Time capsule export functionality
- `StickerPicker`: Emoji/sticker selection
- `SEO`: Search engine optimization component

### Features
1. Memory Management
   - Create, edit, delete memories
   - Rich text content
   - Media attachments
   - Categorization
   - Tags and ratings

2. Time Capsules
   - Schedule future unlocks
   - Collaborative capsules
   - Export functionality
   - Custom themes

3. Journal System
   - Daily entries
   - Mood tracking
   - Voice notes
   - Private/public toggle

4. Analytics
   - Memory statistics
   - Activity tracking
   - Category analysis
   - Yearly highlights

5. Social Features
   - Memory sharing
   - Public board
   - Collaborative memories
   - Legacy access

## Mobile App Implementation Guide

### Recommended Stack
- React Native
- Expo
- Supabase React Native Client

### Key Considerations

1. Authentication
```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://czyefcnulpbcusjiapat.supabase.co'
const supabaseAnonKey = 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

2. Media Handling
- Use React Native Image Picker for media selection
- Implement progressive image loading
- Cache media files locally
- Handle offline storage

3. UI Components to Port
```typescript
interface NativeMemoryFormProps {
  categories: CategoryMetadata[];
  initialData?: MemoryFormData;
  isEditing?: boolean;
  onSubmit: (data: MemoryFormData) => Promise<void>;
  onCancel: () => void;
}

interface NativeTimeCapsuleProps {
  memories: Memory[];
  capsuleName: string;
  onUnlock: () => void;
}
```

4. Offline Support
- Implement queue for pending uploads
- Local storage for drafts
- Sync strategy for conflicts

5. Native Features
- Push notifications
- Camera integration
- Voice recording
- Location services
- Biometric authentication

### Data Models
```typescript
interface Memory {
  id: string;
  title: string;
  content: string;
  category: string;
  metadata: {
    rating?: number;
    tags?: string[];
    attachments?: Attachment[];
  };
  created_at: string;
  unlock_date?: string;
}

interface JournalEntry {
  id: string;
  content: string;
  mood?: string;
  tags: string[];
  voice_note_url?: string;
  entry_date: string;
}
```

### API Integration
1. Setup Supabase Client
```typescript
import { createClient } from '@supabase/supabase-react-native'

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

2. Memory Operations
```typescript
const createMemory = async (data: MemoryData) => {
  const { data: memory, error } = await supabase
    .from('memories')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return memory
}
```

3. File Uploads
```typescript
const uploadAttachment = async (uri: string, path: string) => {
  const response = await fetch(uri)
  const blob = await response.blob()
  
  const { data, error } = await supabase
    .storage
    .from('attachments')
    .upload(path, blob)

  if (error) throw error
  return data
}
```

### Performance Optimization
1. Image Optimization
- Implement lazy loading
- Cache images locally
- Use appropriate image sizes

2. Memory Management
- Implement virtual lists
- Paginate data fetching
- Clear image cache periodically

3. Background Tasks
- Handle uploads in background
- Schedule local notifications
- Sync data periodically

### Security Considerations
1. Secure Storage
- Encrypt sensitive data
- Use secure key storage
- Implement app lock

2. API Security
- Handle token refresh
- Validate API responses
- Implement request timeout

3. Data Privacy
- Respect user privacy settings
- Handle permissions properly
- Clear sensitive data on logout

### Testing Strategy
1. Unit Tests
- Component testing
- API integration testing
- Offline functionality

2. Integration Tests
- Navigation flow
- Data persistence
- Authentication flow

3. End-to-End Tests
- User journeys
- Error scenarios
- Performance testing

## App Store Requirements

### iOS (App Store)
1. Required Assets
- App icons (various sizes)
- Screenshots (iPhone/iPad)
- App preview video
- Privacy policy URL

2. Compliance
- Data privacy declarations
- GDPR compliance
- COPPA compliance
- App tracking transparency

### Android (Play Store)
1. Required Assets
- App icons
- Feature graphic
- Screenshots
- Privacy policy URL

2. Compliance
- Content rating
- Data safety form
- Play Store policies
- Target API level