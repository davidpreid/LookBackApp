# Lookback Capsule

A beautiful digital time capsule application that allows you to capture and preserve your precious memories, locking them away until a future date.

## Features

### 🎁 Time Capsule Creation
- Create personalized time capsules with custom lock periods
- Rich text content support with multimedia attachments
- Voice recording capabilities for audio memories
- Customizable categories and templates
- Tag system for easy organization
- Sticker support for added personalization

### 📸 Media Support
- Image uploads (JPG, PNG, GIF, WebP)
- Voice recordings (WAV, MP3, WebM)
- File size limit of 5MB per attachment
- Secure storage using Supabase

### 🔒 Security & Privacy
- AES-256-GCM encryption for secure storage
- Customizable lock periods (1 month to 5 years)
- Password protection for exports
- Secure file handling and storage

### 💾 Backup & Restore
- USB backup functionality
- Encrypted backup files
- Easy restore process
- Multiple capsule selection for backup

### 🎨 User Interface
- Modern, responsive design
- Intuitive navigation
- Beautiful animations and transitions
- Progress indicators for uploads
- Interactive preview for media files

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **File Upload**: TUS Protocol
- **Encryption**: Web Crypto API
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lookback-capsule.git
cd lookback-capsule
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Time Capsule

1. Click "Create New Time Capsule"
2. Fill in the capsule details:
   - Name your capsule
   - Set a lock period
   - Add a description
3. Add your memory content:
   - Write your memory
   - Add photos or voice recordings
   - Add tags and stickers
   - Set location and date
4. Click "Create Time Capsule" to save

### Backing Up Time Capsules

1. Click the "USB Backup" button
2. Select the capsules to back up
3. Enter a password for encryption
4. Save the encrypted backup file

### Restoring from Backup

1. Click "Restore from Backup"
2. Select your backup file
3. Enter the password
4. Wait for the restore process to complete

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI Components inspired by [Tailwind UI](https://tailwindui.com/)
- Storage powered by [Supabase](https://supabase.com/)

## Support

For support, please open an issue in the GitHub repository or contact us at support@lookbackcapsule.com 