import React, { useState, useEffect } from 'react';
import { Clock, Lock, Unlock, Gift, Sparkles, Search, Plus, Users, Share2, CheckCircle2, Download, Trash2, Edit2, X, ChevronDown, Calendar, MapPin, Tag, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import ExportCapsule from '../components/ExportCapsule';
import USBBackupModal from '../components/USBBackupModal';
import { toast } from 'react-hot-toast';
import { format, addYears, addMonths } from 'date-fns';
import MemoryForm from '../components/MemoryForm';
import { Memory, MemoryFormData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import TimeCapsuleForm from '../components/TimeCapsuleForm';

interface TimeCapsule {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  lock_until: string;
  memory_count?: number;
}

interface Collaborator {
  email: string;
  role: 'viewer' | 'contributor';
}

const LOCK_PERIODS = [
  { label: '1 Month', value: '1m', fn: (date: Date) => addMonths(date, 1) },
  { label: '6 Months', value: '6m', fn: (date: Date) => addMonths(date, 6) },
  { label: '1 Year', value: '1y', fn: (date: Date) => addYears(date, 1) },
  { label: '5 Years', value: '5y', fn: (date: Date) => addYears(date, 5) },
  { label: '10 Years', value: '10y', fn: (date: Date) => addYears(date, 10) },
];

export default function TimeCapsule() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [availableMemories, setAvailableMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemories, setSelectedMemories] = useState<Memory[]>([]);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState<'viewer' | 'contributor'>('viewer');
  const [editingMemory, setEditingMemory] = useState<MemoryFormData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const getInitialMemoryState = () => ({
    id: uuidv4(),
    title: '',
    content: '',
    category: 'movie' as const,
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    mood: '',
    weather: '',
    people: [],
    stickers: [],
    rating: 0,
    tags: [],
    attachments: [],
    sections: [],
    capsule_name: '',
    capsule_description: '',
    metadata: {
      lockPeriod: '1y',
      isAnimated: false
    }
  });
  const [newMemory, setNewMemory] = useState(getInitialMemoryState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lockPeriodDropdownOpen, setLockPeriodDropdownOpen] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [selectedForBackup, setSelectedForBackup] = useState<Memory[]>([]);
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.select-dropdown')) {
        setLockPeriodDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchMemories();
      fetchTimeCapsules();
    }
  }, [user]);

  const fetchMemories = async () => {
    try {
      // Fetch locked memories (time capsules)
      const { data: lockedData, error: lockedError } = await supabase
        .from('memories')
        .select('*')
        .not('unlock_date', 'is', null)
        .order('unlock_date', { ascending: true });

      if (lockedError) throw lockedError;
      
      // Fetch unlocked memories
      const { data: unlockedData, error: unlockedError } = await supabase
        .from('memories')
        .select('*')
        .is('unlock_date', null)
        .order('created_at', { ascending: false });

      if (unlockedError) throw unlockedError;

      // Process attachments and generate signed URLs
      const processMemories = async (memories: any[]) => {
        return Promise.all(
          memories.map(async (memory) => {
            if (memory.metadata?.attachments) {
              const attachmentsWithUrls = await Promise.all(
                memory.metadata.attachments.map(async (attachment: { path?: string; url?: string; type: string; name: string }) => {
                  if (attachment.path) {
                    const { data: signedUrlData } = await supabase.storage
                      .from('memory-images')
                      .createSignedUrl(attachment.path, 3600); // URL expires in 1 hour
                    
                    if (!signedUrlData?.signedUrl) {
                      console.error('Failed to generate signed URL for attachment:', attachment.path);
                      return attachment;
                    }
                    
                    return { ...attachment, url: signedUrlData.signedUrl };
                  }
                  return attachment;
                })
              );
              return { ...memory, metadata: { ...memory.metadata, attachments: attachmentsWithUrls } };
            }
            return memory;
          })
        );
      };

      const processedLockedMemories = await processMemories(lockedData || []);
      const processedUnlockedMemories = await processMemories(unlockedData || []);

      // Update both states
      setMemories(processedLockedMemories);
      setAvailableMemories(processedUnlockedMemories);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Failed to fetch memories');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeCapsules = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('memories')
        .select(`
          id,
          title,
          content,
          created_at,
          unlock_date,
          capsule_name,
          capsule_description,
          metadata,
          user_id
        `)
        .eq('user_id', user.id)
        .not('unlock_date', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data into TimeCapsule format
      const capsules = (data || []).reduce((acc: TimeCapsule[], memory) => {
        // Group memories by capsule name
        const capsuleName = memory.capsule_name;
        if (!capsuleName) return acc;

        const existingCapsule = acc.find(c => c.name === capsuleName);
        if (existingCapsule) {
          existingCapsule.memory_count = (existingCapsule.memory_count || 0) + 1;
          return acc;
        }

        acc.push({
          id: memory.id,
          name: capsuleName,
          description: memory.capsule_description || '',
          user_id: memory.user_id,
          created_at: memory.created_at,
          lock_until: memory.unlock_date,
          memory_count: 1
        });

        return acc;
      }, []);

      setTimeCapsules(capsules);
    } catch (error) {
      console.error('Error fetching time capsules:', error);
      toast.error('Failed to fetch time capsules');
    }
  };

  const calculateUnlockDate = (date: string) => {
    const baseDate = new Date(date);
    return baseDate.toISOString();
  };

  const convertToMemoryFormData = (memory: Memory): MemoryFormData => {
    // Convert memory attachments to form attachments
    const attachments = memory.metadata?.attachments?.map(attachment => ({
      name: attachment.name,
      type: attachment.type,
      size: 0, // We don't have the original file size
      blob: new File([], attachment.name, { type: attachment.type }), // Create a dummy File object
    })) || [];

    return {
      id: memory.id,
      title: memory.title,
      content: memory.content,
      category: memory.category,
      date: new Date(memory.created_at).toISOString().split('T')[0],
      location: memory.metadata?.location || '',
      mood: memory.metadata?.mood || '',
      weather: memory.metadata?.weather || '',
      people: memory.metadata?.people || [],
      stickers: memory.metadata?.stickers || [],
      rating: memory.metadata?.rating || 0,
      tags: memory.metadata?.tags || [],
      attachments,
      sections: memory.metadata?.sections || [],
      capsule_name: memory.capsule_name || '',
      capsule_description: memory.capsule_description || '',
      voiceNote: memory.voice_note ? {
        url: memory.voice_note.url,
        duration: memory.voice_note.duration,
      } : undefined,
      metadata: {
        lockPeriod: memory.metadata?.lockPeriod || '1y',
        isAnimated: memory.metadata?.isAnimated || false
      }
    };
  };

  const convertToMemory = (formData: MemoryFormData, userId: string): Omit<Memory, 'id' | 'created_at'> => {
    const lockPeriod = LOCK_PERIODS.find(p => p.value === formData.metadata?.lockPeriod);
    const unlockDate = lockPeriod ? lockPeriod.fn(new Date()).toISOString() : null;

    // Convert form attachments to memory attachments
    const attachments = formData.attachments.map(attachment => ({
      url: attachment.url || '', // Use the signed URL we generated during upload
      type: attachment.type as 'image' | 'video' | 'audio',
      name: attachment.name,
      path: attachment.path // Include the path for future reference
    }));

    return {
      title: formData.title,
      content: formData.content,
      category: formData.category as 'movie' | 'tv_show' | 'achievement' | 'activity',
      user_id: userId,
      capsule_name: formData.capsule_name,
      capsule_description: formData.capsule_description,
      shared_with: [],
      is_public: false,
      unlock_date: unlockDate,
      voice_note: formData.voiceNote ? {
        url: formData.voiceNote.url,
        duration: formData.voiceNote.duration,
      } : undefined,
      metadata: {
        location: formData.location,
        mood: formData.mood,
        weather: formData.weather,
        people: formData.people,
        stickers: formData.stickers,
        rating: formData.rating,
        tags: formData.tags,
        attachments,
        sections: formData.sections,
        lockPeriod: formData.metadata?.lockPeriod,
        isAnimated: formData.metadata?.isAnimated
      }
    };
  };

  const handleSubmit = async (data: MemoryFormData) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a time capsule');
        return;
      }

      const memoryData = convertToMemory(data, user.id);
      const { error } = await supabase
        .from('memories')
        .insert(memoryData);

      if (error) throw error;

      toast.success('Time capsule created successfully!');
      setShowForm(false);
      resetForm();
      fetchMemories();
    } catch (error) {
      console.error('Error creating time capsule:', error);
      toast.error('Failed to create time capsule');
    }
  };

  const handleAddCollaborator = async () => {
    try {
      if (!editingMemory) return;

      const { error } = await supabase
        .from('memory_collaborators')
        .insert({
          memory_id: editingMemory.id,
          email: collaboratorEmail,
          role: collaboratorRole
        });

      if (error) throw error;

      toast.success('Collaborator added successfully!');
      setCollaboratorEmail('');
      setShowCollaboratorsModal(false);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Failed to add collaborator');
    }
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(convertToMemoryFormData(memory));
    setShowEditForm(true);
  };

  const handleEditSubmit = async (formData: MemoryFormData) => {
    try {
      // Update the memory in the database
      const { error } = await supabase
        .from('memories')
        .update(convertToMemory(formData, user?.id || ''))
        .eq('id', formData.id);

      if (error) throw error;

      // Update the memory in the local state
      setMemories(memories.map(memory =>
        memory.id === formData.id
          ? { ...memory, ...convertToMemory(formData, user?.id || '') }
          : memory
      ));

      setShowEditForm(false);
      setEditingMemory(null);
      toast.success('Memory updated successfully!');
    } catch (error) {
      console.error('Error updating memory:', error);
      toast.error('Failed to update memory');
    }
  };

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this time capsule? This action cannot be undone.')) {
      return;
    }

    try {
      // First check if the user owns this memory
      const { data: memory, error: fetchError } = await supabase
        .from('memories')
        .select('user_id')
        .eq('id', memoryId)
        .single();

      if (fetchError) throw fetchError;

      if (!memory || memory.user_id !== user?.id) {
        toast.error('You can only delete your own time capsules');
        return;
      }

      // Proceed with deletion
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast.success('Time capsule deleted successfully');
      fetchMemories();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error('Failed to delete time capsule. Please try again.');
    }
  };

  const handleMemorySelect = (memory: Memory) => {
    // Don't allow selecting memories without titles or content
    if (!memory.title || !memory.content) {
      toast.error('Memory must have a title and content');
      return;
    }

    setSelectedMemories(prev => {
      const isSelected = prev.some(m => m.id === memory.id);
      if (isSelected) {
        return prev.filter(m => m.id !== memory.id);
      } else {
        return [...prev, memory];
      }
    });
  };

  const filteredMemories = availableMemories.filter(memory =>
    memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isUnlocked = (unlockDate: string) => {
    return new Date(unlockDate) <= new Date();
  };

  const handleUnlock = async (memory: Memory) => {
    if (!isUnlocked(memory.unlock_date!)) return;

    try {
      const { error } = await supabase
        .from('memories')
        .update({
          unlock_date: null
        })
        .eq('id', memory.id);

      if (error) throw error;

      toast.success('Memory unlocked successfully!');
      fetchMemories();
    } catch (error) {
      console.error('Error unlocking memory:', error);
      toast.error('Failed to unlock memory');
    }
  };

  const handleCreateTimeCapsule = async (data: {
    name: string;
    description: string;
    lockPeriod: string;
    selectedMemories: Memory[];
  }) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a time capsule');
        return;
      }

      const lockPeriod = LOCK_PERIODS.find(p => p.value === data.lockPeriod);
      if (!lockPeriod) {
        toast.error('Invalid lock period');
        return;
      }

      const unlockDate = lockPeriod.fn(new Date()).toISOString();

      // Update selected memories with capsule information
      const { error: memoriesError } = await supabase
        .from('memories')
        .update({
          capsule_name: data.name,
          capsule_description: data.description,
          unlock_date: unlockDate
        })
        .in(
          'id',
          data.selectedMemories.map(m => m.id)
        );

      if (memoriesError) throw memoriesError;

      toast.success('Time capsule created successfully!');
      setIsCreating(false);
      fetchMemories();
      fetchTimeCapsules();
    } catch (error) {
      console.error('Error creating time capsule:', error);
      toast.error('Failed to create time capsule');
    }
  };

  const getLockPeriodInMs = (period: string): number => {
    const value = parseInt(period.slice(0, -1));
    const unit = period.slice(-1);
    const multipliers = {
      m: 30 * 24 * 60 * 60 * 1000, // months
      y: 365 * 24 * 60 * 60 * 1000, // years
    };
    return value * multipliers[unit as keyof typeof multipliers];
  };

  const resetForm = () => {
    setNewMemory(getInitialMemoryState());
  };

  const handleBackupSelect = (memory: Memory) => {
    setSelectedForBackup(prev => {
      const isSelected = prev.some(m => m.id === memory.id);
      if (isSelected) {
        return prev.filter(m => m.id !== memory.id);
      } else {
        return [...prev, memory];
      }
    });
  };

  const handleBackupComplete = async () => {
    setShowBackupModal(false);
    setSelectedForBackup([]);
    await fetchMemories();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500">Loading time capsules...</p>
          
          {selectedMemories.length > 0 && (
            <div className="mt-6">
              <ExportCapsule 
                memories={selectedMemories}
                capsuleName={newMemory.capsule_name || 'Time Capsule'}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <SEO 
        title="Time Capsule - Look Back"
        description="Create and manage your digital time capsules. Lock away memories and set future dates to unlock them."
        type="article"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Time Capsules
            </h1>
            <p className="mt-2 text-gray-600">Preserve your memories for the future</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
                       text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                       hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5" />
              Create Time Capsule
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBackupModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600
                         text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                         hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Download className="h-5 w-5" />
                USB Backup
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {isCreating ? (
          <TimeCapsuleForm
            memories={availableMemories}
            onSubmit={handleCreateTimeCapsule}
            onCancel={() => setIsCreating(false)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeCapsules.map((capsule) => (
              <div
                key={capsule.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl
                         transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Gift className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{capsule.name}</h2>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{capsule.description}</p>

                {/* Display memory images */}
                {(() => {
                  const capsuleMemories = memories.filter(memory => memory.capsule_name === capsule.name);
                  const hasImages = capsuleMemories.some(memory => 
                    memory.metadata?.attachments?.some(attachment => attachment.type === 'image')
                  );

                  if (!hasImages) {
                    return (
                      <div className="text-center text-gray-500 text-sm mb-4">
                        No images in this time capsule yet
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {capsuleMemories.map(memory => (
                        memory.metadata?.attachments?.map((attachment, index) => (
                          attachment.type === 'image' && (
                            <div key={`${memory.id}-${index}`} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                          )
                        ))
                      ))}
                    </div>
                  );
                })()}

                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Lock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-900">Locked Until</h3>
                    <p className="text-sm text-amber-700">
                      {format(new Date(capsule.lock_until), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(capsule.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <span className="text-indigo-600 font-medium">
                    {capsule.memory_count || 0} memories
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USB Backup Modal */}
        <USBBackupModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          memories={memories}
          selectedMemories={selectedForBackup}
          onSelectMemory={handleBackupSelect}
          onBackupComplete={handleBackupComplete}
        />
      </div>
    </div>
  );
}