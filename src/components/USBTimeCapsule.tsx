import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { saveAs } from 'file-saver';
import CryptoJS from 'crypto-js';
import {
  Download,
  Upload,
  Lock,
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Memory {
  id: string;
  title: string;
  content: string;
  created_at: string;
  metadata: any;
}

interface TimeCapsuleProps {
  onImportComplete?: () => void;
}

export default function USBTimeCapsule({ onImportComplete }: TimeCapsuleProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsExporting(true);
      
      // Fetch all memories from Supabase
      const { data: memories, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch all associated images
      const imageUrls = memories.reduce((urls: string[], memory: Memory) => {
        const images = memory.content.match(/src="([^"]+)"/g) || [];
        return [...urls, ...images.map(img => img.slice(5, -1))];
      }, []);

      const imageBlobs = await Promise.all(
        imageUrls.map(async (url: string) => {
          const response = await fetch(url);
          const blob = await response.blob();
          return {
            url,
            blob: await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
          };
        })
      );

      // Create backup object with memories and images
      const backupData = {
        memories,
        images: imageBlobs,
        timestamp: new Date().toISOString()
      };

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(backupData),
        password
      ).toString();

      // Create and download the encrypted file
      const blob = new Blob([encrypted], { type: 'application/encrypted' });
      saveAs(blob, `lookback-capsule-${new Date().toISOString()}.enc`);

      toast.success('Time Capsule exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Time Capsule');
    } finally {
      setIsExporting(false);
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    if (!importPassword) {
      toast.error('Please enter the password');
      return;
    }

    try {
      setIsImporting(true);

      // Read the encrypted file
      const fileContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(selectedFile);
      });

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(fileContent, importPassword);
      const backupData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

      // Validate backup data structure
      if (!backupData.memories || !Array.isArray(backupData.memories)) {
        throw new Error('Invalid backup file format');
      }

      // Upload images to Supabase storage
      for (const image of backupData.images) {
        const fileName = image.url.split('/').pop();
        const { error: uploadError } = await supabase.storage
          .from('journal-images')
          .upload(fileName, image.blob);

        if (uploadError && uploadError.message !== 'The resource already exists') {
          throw uploadError;
        }
      }

      // Import memories to Supabase
      for (const memory of backupData.memories) {
        const { error: insertError } = await supabase
          .from('memories')
          .upsert(memory, { onConflict: 'id' });

        if (insertError) throw insertError;
      }

      toast.success('Time Capsule imported successfully');
      onImportComplete?.();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import Time Capsule. Please check your password.');
    } finally {
      setIsImporting(false);
      setImportPassword('');
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-lg">
      {/* Export Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Time Capsule
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Enter encryption password"
              />
              <Lock className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="mt-1 relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Confirm encryption password"
              />
              <Key className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export to USB
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Time Capsule
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Backup File</label>
            <input
              type="file"
              accept=".enc"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Decryption Password</label>
            <div className="mt-1 relative">
              <input
                type="password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Enter decryption password"
              />
              <Key className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleImport}
            disabled={isImporting || !selectedFile}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isImporting ? (
              <>Importing...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import from USB
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Security Information
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            All data is encrypted using AES-256 encryption
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Passwords are never stored or transmitted
          </li>
          <li className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Keep your password safe - it cannot be recovered if lost
          </li>
        </ul>
      </div>
    </div>
  );
} 