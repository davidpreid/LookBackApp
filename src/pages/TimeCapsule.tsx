import React, { useState, useEffect } from 'react';
import { Clock, Lock, Unlock, Gift, Sparkles, Search, Plus, Users, Share2, CheckCircle2, Download, Trash2, Edit2, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import ExportCapsule from '../components/ExportCapsule';
import USBBackupModal from '../components/USBBackupModal';
import toast from 'react-hot-toast';
import { format, addYears, addMonths } from 'date-fns';
import MemoryForm from '../components/MemoryForm';
import { Memory, MemoryFormData } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
    fetchMemories();
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

      // Update both states
      setMemories(lockedData || []);
      setAvailableMemories(unlockedData || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Error fetching time capsules');
    } finally {
      setLoading(false);
    }
  };

  const calculateUnlockDate = (date: string) => {
    const baseDate = new Date(date);
    return baseDate.toISOString();
  };

  const convertToMemoryFormData = (memory: Memory): MemoryFormData => {
    return {
      id: memory.id,
      title: memory.title,
      content: memory.content,
      category: memory.category,
      description: memory.capsule_description || '',
      date: new Date(memory.created_at).toISOString().split('T')[0],
      location: memory.metadata?.location || '',
      mood: memory.metadata?.mood || '',
      weather: memory.metadata?.weather || '',
      people: memory.metadata?.people || [],
      stickers: memory.metadata?.stickers || [],
      rating: memory.metadata?.rating || 0,
      tags: memory.metadata?.tags || [],
      attachments: memory.metadata?.attachments || [],
      sections: memory.metadata?.sections || [],
      capsule_name: memory.capsule_name || '',
      capsule_description: memory.capsule_description || '',
      metadata: {
        lockPeriod: memory.metadata?.lockPeriod || '1y',
        isAnimated: memory.metadata?.isAnimated || false
      }
    };
  };

  const convertToMemory = (formData: MemoryFormData, userId: string): Omit<Memory, 'id' | 'created_at'> => {
    const lockPeriod = LOCK_PERIODS.find(p => p.value === formData.metadata.lockPeriod);
    const unlockDate = lockPeriod ? lockPeriod.fn(new Date()).toISOString() : null;

    return {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      user_id: userId,
      capsule_name: formData.capsule_name,
      capsule_description: formData.capsule_description,
      shared_with: [],
      is_public: false,
      unlock_date: unlockDate,
      metadata: {
        location: formData.location,
        mood: formData.mood,
        weather: formData.weather,
        people: formData.people,
        stickers: formData.stickers,
        rating: formData.rating,
        tags: formData.tags,
        attachments: formData.attachments,
        sections: formData.sections,
        lockPeriod: formData.metadata.lockPeriod,
        isAnimated: formData.metadata.isAnimated
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

  const handleCreateTimeCapsule = async () => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a time capsule');
        return;
      }

      if (selectedMemories.length === 0) {
        toast.error('Please select at least one memory to include in the time capsule');
        return;
      }

      // Create memories for selected items
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .insert(selectedMemories.map(memory => convertToMemory(convertToMemoryFormData(memory), user.id)))
        .select();

      if (memoriesError) throw memoriesError;

      // Reset form
      setSelectedMemories([]);
      resetForm();

      setShowSuccess(true);
      toast.success('Time capsule created successfully!');
    } catch (error) {
      console.error('Error creating time capsule:', error);
      toast.error('Failed to create time capsule');
    }
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
              onClick={() => setShowForm(!showForm)}
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
        {showForm && (
          <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                Create New Time Capsule
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <MemoryForm
              categories={[
                { category: 'movie', icon_name: 'Film', color: '#FF5733', description: 'Movies' },
                { category: 'tv_show', icon_name: 'Tv', color: '#33FF57', description: 'TV Shows' },
                { category: 'achievement', icon_name: 'Trophy', color: '#3357FF', description: 'Achievements' },
                { category: 'activity', icon_name: 'Activity', color: '#FF33F5', description: 'Activities' }
              ]}
              initialData={newMemory}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                resetForm();
              }}
            />
          </div>
        )}

        {showCollaboratorsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Collaborators
              </h3>
              <form onSubmit={handleAddCollaborator} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Collaborator Email
                  </label>
                  <input
                    type="email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={collaboratorRole}
                    onChange={(e) => setCollaboratorRole(e.target.value as 'viewer' | 'contributor')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="contributor">Contributor</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCollaboratorsModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Collaborator
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit Memory Modal */}
        {showEditForm && editingMemory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Memory</h3>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingMemory(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <MemoryForm
                categories={[
                  { category: 'movie', icon_name: 'Film', color: '#FF5733', description: 'Movies' },
                  { category: 'tv_show', icon_name: 'Tv', color: '#33FF57', description: 'TV Shows' },
                  { category: 'achievement', icon_name: 'Trophy', color: '#3357FF', description: 'Achievements' },
                  { category: 'activity', icon_name: 'Activity', color: '#FF33F5', description: 'Activities' }
                ]}
                initialData={editingMemory}
                isEditing={true}
                onSubmit={handleEditSubmit}
                onCancel={() => {
                  setShowEditForm(false);
                  setEditingMemory(null);
                }}
              />
            </div>
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

        {/* Time Capsules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => {
            const unlocked = isUnlocked(memory.unlock_date!);
            const showUnlockAnimation = unlocked && !memory.metadata.isAnimated;
            const unlockDate = new Date(memory.unlock_date!);

            return (
              <div
                key={memory.id}
                className={`relative group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20
                          transform transition-all duration-500 hover:shadow-2xl overflow-hidden
                          ${showUnlockAnimation ? 'animate-unlock scale-105' : 'hover:scale-[1.02]'}`}
                onClick={() => handleUnlock(memory)}
              >
                {/* Status Banner */}
                <div className={`absolute top-0 left-0 right-0 h-2
                              ${unlocked 
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
                                : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                />

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        {memory.capsule_name || 'Time Capsule'}
                      </h3>
                      {memory.capsule_description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {memory.capsule_description}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0
                                  ${unlocked 
                                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                                    : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}
                    >
                      {unlocked ? (
                        showUnlockAnimation ? (
                          <Gift className="h-5 w-5 text-white animate-bounce" />
                        ) : (
                          <Unlock className="h-5 w-5 text-white" />
                        )
                      ) : (
                        <Lock className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Unlock Date */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className={`${unlocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {unlocked ? 'Unlocked' : `Unlocks on ${format(unlockDate, 'MMM d, yyyy')}`}
                      </span>
                    </div>
                  </div>

                  {unlocked ? (
                    <>
                      <div className="prose prose-sm max-w-none mb-4">
                        <p className="text-gray-600 line-clamp-3">{memory.content}</p>
                      </div>
                      {memory.metadata.tags && memory.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {memory.metadata.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                       bg-indigo-50 text-indigo-600 border border-indigo-100"
                            >
                              {tag}
                            </span>
                          ))}
                          {memory.metadata.tags.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                         bg-gray-50 text-gray-600">
                              +{memory.metadata.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="text-center">
                        <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          This time capsule is locked until {format(unlockDate, 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Created {format(new Date(memory.created_at), 'MMM d, yyyy')}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {unlocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(memory);
                          }}
                          className="p-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-indigo-600 
                                   rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit Memory"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(memory.id);
                        }}
                        className="p-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-red-600 
                                 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Delete Time Capsule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForBackup([memory]);
                          setShowBackupModal(true);
                        }}
                        className="p-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-emerald-600 
                                 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Backup to USB"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {memories.length === 0 && (
            <div className="col-span-full">
              <div className="text-center py-16">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-white/20">
                  <Gift className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Time Capsules Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start preserving your precious memories for the future. Create your first time capsule now!
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
                             text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                             hover:translate-y-[-1px]"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Capsule
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}