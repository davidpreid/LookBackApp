import React, { useState } from 'react';
import { Download, Lock, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

interface ExportCapsuleProps {
  memories: Array<{
    title: string;
    content: string;
    created_at: string;
    metadata: {
      tags?: string[];
      attachments?: Array<{
        url: string;
        type: string;
        name: string;
      }>;
    };
  }>;
  capsuleName: string;
  onComplete?: () => void;
}

export default function ExportCapsule({ memories, capsuleName, onComplete }: ExportCapsuleProps) {
  const [password, setPassword] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setExporting(true);
    try {
      const zip = new JSZip();
      
      // Create a manifest file with capsule metadata
      const manifest = {
        name: capsuleName,
        exportedAt: new Date().toISOString(),
        totalMemories: memories.length,
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // Add each memory as a JSON file
      memories.forEach((memory, index) => {
        const memoryData = {
          ...memory,
          exportedAt: new Date().toISOString(),
        };
        zip.file(`memories/${index + 1}_${memory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`, 
          JSON.stringify(memoryData, null, 2));
      });

      // Add a README file
      const readme = `# ${capsuleName} Time Capsule

This time capsule was exported on ${new Date().toLocaleString()}
Total memories: ${memories.length}

## Contents
- manifest.json: Contains capsule metadata
- memories/: Directory containing all memory files
- attachments/: Directory containing all media files

Each memory file includes:
- Title
- Content
- Creation date
- Tags
- Attachments references

To view the contents:
1. Extract the ZIP file using the password you set
2. Open the JSON files in a text editor
3. Media files can be found in the attachments directory`;

      zip.file('README.md', readme);

      // Generate the zip without encryption first
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });

      // Convert blob to array buffer for encryption
      const arrayBuffer = await content.arrayBuffer();
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      // Create a key from the password
      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Derive an AES-GCM key
      const aesKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new Uint8Array(16),
          iterations: 100000,
          hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt']
      );

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the content
      const encryptedContent = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        aesKey,
        arrayBuffer
      );

      // Combine IV and encrypted content
      const finalContent = new Blob([
        iv,
        new Uint8Array(encryptedContent)
      ], { type: 'application/octet-stream' });

      // Create download link
      const url = URL.createObjectURL(finalContent);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${capsuleName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_encrypted.bin`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Time capsule exported successfully');
      setPassword('');
      onComplete?.();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export time capsule');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Lock className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Export Time Capsule</h3>
        </div>
        <div className="flex items-center text-amber-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">Keep your password safe!</span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">
        Export your time capsule as an encrypted ZIP file. Make sure to save your password - you'll need it to access your memories later.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Set Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 
                     rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter a secure password"
            minLength={8}
            required
          />
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || !password || password.length < 8}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r 
                   from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <Download className="h-5 w-5" />
          {exporting ? 'Exporting...' : 'Export to USB'}
        </button>
      </div>
    </div>
  );
}