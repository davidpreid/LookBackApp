import React, { useState, useEffect } from 'react';
import { Plus, Share2, Users, Edit2, Lock, Search, X, Trash2, Sparkles, ChevronDown, Cake, UtensilsCrossed, Gift, Award, Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import MemoryForm from '../components/MemoryForm';
import MemoryContent from '../components/MemoryContent';
import { CategoryMetadata, Memory, MemoryFormData } from '../types';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';

interface MemoryTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  content: string;
  metadata: {
    tags: string[];
    sections?: {
      name: string;
      type: 'text' | 'list' | 'checkbox';
      placeholder?: string;
    }[];
  };
}

const MEMORY_TEMPLATES: MemoryTemplate[] = [
  {
    id: 'recipe',
    name: 'Recipe',
    icon: <UtensilsCrossed className="h-5 w-5" />,
    category: 'recipes',
    title: 'New Recipe',
    content: '',
    metadata: {
      tags: ['recipe', 'cooking'],
      sections: [
        { name: 'Ingredients', type: 'list', placeholder: 'Add ingredients...' },
        { name: 'Instructions', type: 'list', placeholder: 'Add steps...' },
        { name: 'Cooking Time', type: 'text', placeholder: 'e.g., 45 minutes' },
        { name: 'Servings', type: 'text', placeholder: 'e.g., 4 servings' },
        { name: 'Notes', type: 'text', placeholder: 'Additional notes...' }
      ]
    }
  },
  {
    id: 'birthday',
    name: 'Birthday Celebration',
    icon: <Cake className="h-5 w-5" />,
    category: 'celebrations',
    title: 'Birthday Celebration',
    content: '',
    metadata: {
      tags: ['birthday', 'celebration'],
      sections: [
        { name: 'Who We Celebrated', type: 'text', placeholder: 'Name of the birthday person...' },
        { name: 'Location', type: 'text', placeholder: 'Where did we celebrate?' },
        { name: 'Attendees', type: 'list', placeholder: 'Who attended?' },
        { name: 'Highlights', type: 'list', placeholder: 'Special moments...' },
        { name: 'Gifts', type: 'list', placeholder: 'Gifts received/given...' }
      ]
    }
  },
  {
    id: 'achievement',
    name: 'Achievement',
    icon: <Award className="h-5 w-5" />,
    category: 'milestones',
    title: 'New Achievement',
    content: '',
    metadata: {
      tags: ['achievement', 'milestone'],
      sections: [
        { name: 'Achievement Type', type: 'text', placeholder: 'What was achieved?' },
        { name: 'Date Achieved', type: 'text', placeholder: 'When was it achieved?' },
        { name: 'Journey', type: 'text', placeholder: 'Describe the journey...' },
        { name: 'Key Learnings', type: 'list', placeholder: 'What did you learn?' },
        { name: 'Next Goals', type: 'list', placeholder: 'Future goals...' }
      ]
    }
  },
  {
    id: 'special-day',
    name: 'Special Day',
    icon: <Calendar className="h-5 w-5" />,
    category: 'events',
    title: 'Special Day',
    content: '',
    metadata: {
      tags: ['special-day', 'event'],
      sections: [
        { name: 'Event Type', type: 'text', placeholder: 'What kind of special day?' },
        { name: 'Date', type: 'text', placeholder: 'When did it happen?' },
        { name: 'Location', type: 'text', placeholder: 'Where did it take place?' },
        { name: 'People Involved', type: 'list', placeholder: 'Who was there?' },
        { name: 'Memorable Moments', type: 'list', placeholder: 'Special moments...' },
        { name: 'Photos/Videos', type: 'list', placeholder: 'Media captured...' }
      ]
    }
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryMetadata[]>([]);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, { full_name: string }>>({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MemoryTemplate | null>(null);
  const [transformedTemplate, setTransformedTemplate] = useState<MemoryFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      if (!user) return;
      
      try {
        // Clear any existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Set a new timeout to debounce the fetch
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          await Promise.all([
            fetchMemories(),
            fetchCategories()
          ]);
        }, 100); // 100ms debounce
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user?.id]); // Only depend on user.id instead of the entire user object

  useEffect(() => {
    if (memories.length > 0) {
      fetchUserProfiles();
    }
  }, [memories]);

  const fetchUserProfiles = async () => {
    try {
      const userIds = [...new Set(memories.map(m => m.user_id))];
      if (userIds.length === 0) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching user profiles:', error);
        return;
      }

      const profileMap = (data || []).reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile
      }), {});

      setUserProfiles(profileMap);
    } catch (error) {
      console.warn('Failed to fetch user profiles:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('category_metadata').select('*').order('category');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories. Please try refreshing the page.');
    }
  };

  const fetchMemories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*') 
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Raw memories data:', data);

      // Get signed URLs for all attachments
      const memoriesWithSignedUrls = await Promise.all(
        (data || []).map(async (memory) => {
          if (memory.metadata?.attachments) {
            console.log('Processing attachments for memory:', memory.id);
            console.log('Original attachments:', memory.metadata.attachments);
            
            const attachmentsWithUrls = await Promise.all(
              memory.metadata.attachments.map(async (attachment: { path?: string; url?: string; type: string; name: string }) => {
                // If we already have a valid URL, use it
                if (attachment.url) {
                  console.log('Using existing URL:', attachment.url);
                  return attachment;
                }
                
                // Only generate a new signed URL if we have a path but no URL
                if (attachment.path && !attachment.url) {
                  console.log('Generating signed URL for path:', attachment.path);
                  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                    .from('memory-images')
                    .createSignedUrl(attachment.path, 3600);
                  
                  if (signedUrlError) {
                    console.error('Error generating signed URL:', signedUrlError);
                    return attachment;
                  }
                  
                  if (!signedUrlData?.signedUrl) {
                    console.error('No signed URL generated for attachment:', attachment.path);
                    return attachment;
                  }
                  
                  console.log('Generated signed URL:', signedUrlData.signedUrl);
                  return { ...attachment, url: signedUrlData.signedUrl };
                }
                
                return attachment;
              })
            );
            
            console.log('Processed attachments:', attachmentsWithUrls);
            return { ...memory, metadata: { ...memory.metadata, attachments: attachmentsWithUrls } };
          }
          return memory;
        })
      );

      console.log('Final processed memories:', memoriesWithSignedUrls);
      setMemories(memoriesWithSignedUrls);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Unable to load memories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: MemoryFormData) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a memory');
        return;
      }

      console.log('Form data before processing:', formData);
      console.log('Attachments before processing:', formData.attachments);

      // Transform form data into database format
      const memoryData = {
        title: formData.title,
        content: formData.content,
        category: formData.category || 'note', // Default to 'note' if no category selected
        user_id: user.id,
        shared_with: [],
        is_public: false,
        metadata: {
          location: formData.location,
          mood: formData.mood,
          stickers: formData.stickers,
          tags: [...new Set(formData.tags)], // Deduplicate tags
          attachments: formData.attachments
            .filter(att => att.url) // Only include attachments that have a URL
            .map(att => ({
              name: att.name,
              type: att.type,
              url: att.url,
              path: att.path
            }))
        }
      };

      console.log('Memory data before submission:', memoryData);
      console.log('Attachments before submission:', memoryData.metadata.attachments);

      const { data, error } = await supabase
        .from('memories')
        .insert([memoryData])
        .select()
        .single();

      if (error) throw error;

      console.log('Memory created:', data);
      console.log('Memory attachments after creation:', data.metadata?.attachments);

      // Add the memory to the state
      setMemories(prevMemories => [data, ...prevMemories]);

      toast.success('Memory added successfully');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding memory:', error);
      toast.error('Error adding memory');
    }
  };

  const handleEdit = async (memory: Memory) => {
    setEditingMemory(memory);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (formData: any) => {
    try {
      if (!user?.id || !editingMemory) return;

      // Transform form data into database format
      const memoryData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        metadata: {
          ...formData.metadata,
          tags: [...new Set(formData.tags)], // Deduplicate tags
          attachments: formData.attachments.map((att: any) => ({
            name: att.name,
            type: att.type,
            path: att.path, // Store the path for future reference
            url: att.url || '', // Ensure URL is never undefined
            blob: undefined // Don't store blob in database
          })).filter((att: any) => att.path && att.url) // Only include attachments with both path and URL
        }
      };

      console.log('Updating memory with data:', memoryData);

      const { error } = await supabase
        .from('memories')
        .update(memoryData)
        .eq('id', editingMemory.id);

      if (error) throw error;

      toast.success('Memory updated successfully');
      setShowEditForm(false);
      setEditingMemory(null);
      fetchMemories();
    } catch (error) {
      console.error('Error updating memory:', error);
      toast.error('Error updating memory');
    }
  };

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;

      toast.success('Memory deleted successfully');
      fetchMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory');
    }
  };

  const handleTemplateSelect = (template: MemoryTemplate) => {
    const newTransformedTemplate: MemoryFormData = {
      title: template.title,
      content: template.content,
      category: template.category as 'movie' | 'tv_show' | 'achievement' | 'activity' | '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      mood: '',
      stickers: [],
      tags: template.metadata.tags || [],
      attachments: [],
      metadata: {
        lockPeriod: undefined,
        isAnimated: false
      }
    };
    setTransformedTemplate(newTransformedTemplate);
    setSelectedTemplate(template);
    setShowTemplates(false);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-gray-600">Loading memories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <SEO title="Your Memories - Look Back" description="View and manage your memories." type="article" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Your Memories
            </h1>
            <p className="mt-2 text-gray-600">Capture and preserve your precious moments</p>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 transition-all duration-200 hover:scale-[1.02]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Memory
            </motion.button>
            <motion.button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center px-4 py-2.5 bg-white/80 backdrop-blur-sm text-indigo-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 transition-all duration-200 hover:scale-[1.02] border border-indigo-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Templates
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showTemplates ? 'rotate-180' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Templates Dropdown */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowTemplates(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                    Choose a Template
                  </h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Select a template to quickly create structured memories for different occasions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MEMORY_TEMPLATES.map((template) => (
                    <motion.button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="flex items-start space-x-4 p-4 rounded-xl hover:bg-indigo-50/50 transition-all duration-200 group text-left border border-white/40 hover:border-indigo-200 bg-white/50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all duration-200">
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                        <div className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {template.metadata.sections?.map(s => s.name).join(' • ')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {template.metadata.tags.map((tag, index) => (
                            <span
                              key={`${template.id}-${tag}-${index}`}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100/50 text-indigo-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Can't find what you're looking for?
                    </p>
                    <button
                      onClick={() => {
                        setShowTemplates(false);
                        setShowForm(true);
                      }}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Create without template →
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-xl"></div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search memories..."
                className="block w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-full shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition-all duration-300 hover:shadow-xl hover:bg-white/90 text-center"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                <Search className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <AnimatePresence>
            {memories
              .filter(memory =>
                memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                memory.metadata.tags?.some(tag => 
                  tag.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((memory, index) => (
                <motion.div
                  key={`${memory.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl transition-all duration-300 group-hover:shadow-2xl"></div>
                  <div className="relative p-6">
                    {memory.unlock_date && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-[2px] rounded-2xl">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                          <Lock className="h-5 w-5 text-amber-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Locked until {format(new Date(memory.unlock_date), 'PPP')}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        {memory.title}
                      </h3>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <motion.button
                          onClick={() => handleEdit(memory)}
                          className="p-2 bg-white/80 hover:bg-white text-gray-700 hover:text-indigo-600 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(memory.id)}
                          className="p-2 bg-white/80 hover:bg-white text-gray-700 hover:text-red-600 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>

                    <MemoryContent memory={memory} className="mb-4" />

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{format(new Date(memory.created_at), 'PPP')}</span>
                      {memory.is_collaborative && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Collaborative</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </AnimatePresence>
        </div>

        {/* Memory Form with Template Support */}
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowForm(false);
                setEditingMemory(null);
                setSelectedTemplate(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ 
                  duration: 0.2,
                  type: "spring",
                  stiffness: 260,
                  damping: 20 
                }}
                className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto modal-scroll"
                onClick={e => e.stopPropagation()}
              >
                <motion.div
                  layout
                  className="space-y-6"
                >
                  <motion.div 
                    layout="position"
                    className="flex items-center justify-between"
                  >
                    <motion.h2 
                      layout="position"
                      className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
                    >
                      {editingMemory ? 'Edit Memory' : selectedTemplate ? `New ${selectedTemplate.name}` : 'Add New Memory'}
                    </motion.h2>
                    <div className="flex items-center space-x-2">
                      {selectedTemplate && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => setSelectedTemplate(null)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </motion.button>
                      )}
                      <motion.button
                        layout="position"
                        onClick={() => {
                          setShowForm(false);
                          setEditingMemory(null);
                          setSelectedTemplate(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div
                    layout
                    className={`relative ${isSubmitting ? 'form-loading' : ''}`}
                  >
                    <MemoryForm
                      initialData={editingMemory ? {
                        ...editingMemory,
                        date: new Date(editingMemory.created_at).toISOString().split('T')[0],
                        location: editingMemory.metadata.location || '',
                        mood: editingMemory.metadata.mood || '',
                        stickers: editingMemory.metadata.stickers || [],
                        tags: editingMemory.metadata.tags || [],
                        attachments: editingMemory.metadata.attachments?.map(att => ({
                          name: att.name,
                          type: att.type,
                          size: 0,
                          blob: new Blob(),
                          url: att.url,
                          path: att.path
                        })) || [],
                      } : transformedTemplate || undefined}
                      isEditing={!!editingMemory}
                      onSubmit={async (data) => {
                        setIsSubmitting(true);
                        try {
                          await handleSubmit(data);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingMemory(null);
                        setSelectedTemplate(null);
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Memory Modal */}
        <AnimatePresence>
          {showEditForm && editingMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowEditForm(false);
                setEditingMemory(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ 
                  duration: 0.2,
                  type: "spring",
                  stiffness: 260,
                  damping: 20 
                }}
                className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto modal-scroll"
                onClick={e => e.stopPropagation()}
              >
                <motion.div
                  layout
                  className="space-y-6"
                >
                  <motion.div 
                    layout="position"
                    className="flex justify-between items-center"
                  >
                    <motion.h3 
                      layout="position"
                      className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
                    >
                      Edit Memory
                    </motion.h3>
                    <motion.button
                      layout="position"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingMemory(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </motion.button>
                  </motion.div>

                  <motion.div
                    layout
                    className={`relative ${isSubmitting ? 'form-loading' : ''}`}
                  >
                    <MemoryForm
                      initialData={{
                        ...editingMemory,
                        date: new Date(editingMemory.created_at).toISOString().split('T')[0],
                        location: editingMemory.metadata.location || '',
                        mood: editingMemory.metadata.mood || '',
                        stickers: editingMemory.metadata.stickers || [],
                        tags: editingMemory.metadata.tags || [],
                        attachments: editingMemory.metadata.attachments?.map(att => ({
                          name: att.name,
                          type: att.type,
                          size: 0,
                          blob: new Blob(),
                          url: att.url,
                          path: att.path
                        })) || [],
                      }}
                      isEditing={true}
                      onSubmit={async (data) => {
                        setIsSubmitting(true);
                        try {
                          await handleEditSubmit(data);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      onCancel={() => {
                        setShowEditForm(false);
                        setEditingMemory(null);
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}