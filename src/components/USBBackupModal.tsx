import React, { useState, useRef } from 'react';
import { Download, Upload, Lock, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { Memory } from '../types';
import { supabase } from '../lib/supabase';

interface USBBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  selectedMemories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onBackupComplete: () => void;
}

export default function USBBackupModal({
  isOpen,
  onClose,
  memories,
  selectedMemories,
  onSelectMemory,
  onBackupComplete
}: USBBackupModalProps) {
  const [password, setPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (selectedMemories.length === 0) {
      toast.error('Please select at least one time capsule');
      return;
    }

    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      // Create a manifest file
      const manifest = {
        name: `Time_Capsules_Backup_${new Date().toISOString().split('T')[0]}`,
        exportedAt: new Date().toISOString(),
        totalMemories: selectedMemories.length,
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // Add each memory
      selectedMemories.forEach((memory, index) => {
        zip.file(`memories/${index + 1}_${memory.capsule_name || 'capsule'}.json`, 
          JSON.stringify(memory, null, 2));
      });

      // Add README
      const readme = `# Time Capsules Backup

Created on: ${new Date().toLocaleString()}
Total capsules: ${selectedMemories.length}

## Contents
- manifest.json: Backup metadata
- memories/: Time capsule data
- attachments/: Media files

To restore:
1. Use the same password used during backup
2. Use the "Restore from Backup" option
3. Select this file when prompted`;

      zip.file('README.md', readme);

      // Generate and encrypt zip
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      // Encrypt the content
      const arrayBuffer = await content.arrayBuffer();
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      // Create encryption key
      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

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

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        arrayBuffer
      );

      // Save encrypted file
      const finalContent = new Blob([
        iv,
        new Uint8Array(encryptedContent)
      ], { type: 'application/octet-stream' });

      const url = URL.createObjectURL(finalContent);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'time_capsules_backup.bin';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Time capsules backed up successfully');
      setPassword('');
      onBackupComplete();
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Failed to backup time capsules');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!password) {
      toast.error('Please enter the backup password');
      return;
    }

    setIsRestoring(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const iv = new Uint8Array(arrayBuffer.slice(0, 12));
      const encryptedContent = new Uint8Array(arrayBuffer.slice(12));

      // Decrypt the content
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

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
        ['decrypt']
      );

      const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encryptedContent
      );

      const zip = await JSZip.loadAsync(decryptedContent);
      
      // Read and parse manifest
      const manifestContent = await zip.file('manifest.json')?.async('text');
      if (!manifestContent) {
        throw new Error('Invalid backup file: missing manifest.json');
      }
      const manifest = JSON.parse(manifestContent);

      if (!manifest.totalMemories) {
        throw new Error('Invalid backup file: invalid manifest');
      }

      // Read and restore memories
      const memoryFiles = Object.keys(zip.files).filter(path => path.startsWith('memories/'));
      const memories = await Promise.all(
        memoryFiles.map(async path => {
          const content = await zip.file(path)?.async('text');
          return content ? JSON.parse(content) : null;
        })
      );

      // Filter out any null values and memories without required fields
      const validMemories = memories.filter(memory => 
        memory && 
        memory.id &&
        memory.capsule_name &&
        memory.capsule_description &&
        memory.content &&
        memory.created_at &&
        memory.metadata
      );

      if (validMemories.length === 0) {
        throw new Error('No valid memories found in backup. Please ensure you are using a valid backup file.');
      }

      // Insert memories into database
      const { data, error } = await supabase
        .from('memories')
        .upsert(
          validMemories.map(memory => ({
            ...memory,
            // Preserve the original creation date
            created_at: memory.created_at
          }))
        );

      if (error) throw error;

      toast.success(`Successfully restored ${validMemories.length} time capsules`);
      setPassword('');
      onBackupComplete();
    } catch (error) {
      console.error('Restore error:', error);
      if (error instanceof Error) {
        toast.error(`Failed to restore backup: ${error.message}`);
      } else {
        toast.error('Failed to restore backup. Please check your password.');
      }
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Download className="h-8 w-8 text-emerald-600" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">
              {showRestore ? 'Restore from Backup' : 'Backup Time Capsules'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                {showRestore ? (
                  <Upload className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Download className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900">
                  {showRestore ? 'Restore Instructions' : 'Backup Instructions'}
                </h3>
                <p className="text-sm text-emerald-700 mt-1">
                  {showRestore
                    ? 'Select your backup file and enter the password used during backup to restore your time capsules.'
                    : 'Select the time capsules you want to backup. The files will be encrypted and saved to your USB drive.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {showRestore && '(used during backup)'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 
                         rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={showRestore ? 'Enter backup password' : 'Set backup password'}
                minLength={8}
                required
              />
            </div>

            {!showRestore && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Select Time Capsules</h3>
                <div className="max-h-[300px] overflow-y-auto space-y-3">
                  {memories.map((memory) => (
                    <div
                      key={memory.id}
                      onClick={() => onSelectMemory(memory)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer
                                ${selectedMemories.some(m => m.id === memory.id)
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-white hover:bg-gray-50 border-gray-200'
                                }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{memory.capsule_name || 'Time Capsule'}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Created {new Date(memory.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-200
                                    ${selectedMemories.some(m => m.id === memory.id)
                                      ? 'bg-emerald-500 border-emerald-500'
                                      : 'bg-white border-gray-300'
                                    }`}
                      >
                        {selectedMemories.some(m => m.id === memory.id) && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <button
              onClick={() => setShowRestore(!showRestore)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showRestore ? 'Switch to Backup' : 'Switch to Restore'}
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700
                         hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              
              {showRestore ? (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleRestore}
                    accept=".bin"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRestoring || !password}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600
                             text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50
                             transition-all duration-300 hover:translate-y-[-1px]"
                  >
                    <Upload className="h-4 w-4" />
                    {isRestoring ? 'Restoring...' : 'Select Backup File'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBackup}
                  disabled={isExporting || !password || selectedMemories.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600
                           text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50
                           transition-all duration-300 hover:translate-y-[-1px]"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Backing up...' : `Backup Selected (${selectedMemories.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 