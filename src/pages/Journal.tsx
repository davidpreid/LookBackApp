import React, { useState, useEffect } from 'react';
import { Calendar, Smile, Tag, Mic, Lock, Unlock, Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import RichTextEditor from '../components/RichTextEditor';
import toast from 'react-hot-toast';
import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/journal.css';

interface JournalEntry {
  id: string;
  entry_date: string;
  content: string;
  mood: string;
  tags: string[];
  is_private: boolean;
  unlock_date: string | null;
  voice_note_url: string | null;
  created_at: string;
  updated_at: string;
  metadata: {
    attachments?: {
      url: string;
      type: 'image' | 'video';
      name: string;
    }[];
  };
}

const MOODS = ['😊', '😢', '😡', '😴', '🤔', '😎', '🥳', '😌', '😍', '😅'];

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    content: '',
    mood: '',
    tags: [],
    is_private: true,
    metadata: { attachments: [] }
  });
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const MAX_RECORDING_DURATION = 600; // 10 minutes in seconds

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  // Cleanup function for preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!newEntry.entry_date || !newEntry.content) {
      toast.error('Date and content are required');
      return;
    }

    // Create a copy of the entry for optimistic update
    const entryToSave = {
      ...newEntry,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    // For optimistic updates
    const previousEntries = [...entries];
    
    try {
      // First check if we have unsaved audio that needs to be uploaded
      if (audioChunks.length > 0) {
        const voiceNoteUrl = await saveVoiceNote();
        entryToSave.voice_note_url = voiceNoteUrl;
      }

      // Update UI optimistically
      if (entryToSave.id) {
        // Update existing entry
        setEntries(entries.map(entry => 
          entry.id === entryToSave.id 
            ? { ...entry, ...entryToSave } as JournalEntry
            : entry
        ));
      } else {
        // Add new entry with temporary ID
        const tempEntry = {
          ...entryToSave,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
        } as JournalEntry;
        setEntries([tempEntry, ...entries]);
      }

      // Close form early for better UX
      setShowForm(false);

      // Perform actual API operation
      if (entryToSave.id && !entryToSave.id.startsWith('temp-')) {
        // Update operation
        const { error } = await supabase
          .from('journal_entries')
          .update({
            entry_date: entryToSave.entry_date,
            content: entryToSave.content,
            mood: entryToSave.mood,
            tags: entryToSave.tags,
            is_private: entryToSave.is_private,
            voice_note_url: entryToSave.voice_note_url,
            metadata: entryToSave.metadata
          })
          .eq('id', entryToSave.id);

        if (error) throw error;
        toast.success('Journal entry updated successfully');
      } else {
        // Create operation
        const { data, error } = await supabase
          .from('journal_entries')
          .insert([{
            entry_date: entryToSave.entry_date,
            content: entryToSave.content,
            mood: entryToSave.mood,
            tags: entryToSave.tags,
            is_private: entryToSave.is_private,
            voice_note_url: entryToSave.voice_note_url,
            metadata: entryToSave.metadata,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Update the temporary entry with the real one
        setEntries(entries => entries.map(entry => 
          entry.id.startsWith('temp-') ? data : entry
        ));
        
        toast.success('Journal entry saved successfully');
      }

      // Reset form
      setNewEntry({
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        content: '',
        mood: '',
        tags: [],
        is_private: true,
        metadata: { attachments: [] }
      });
    } catch (error: any) {
      // Revert optimistic update on error
      setEntries(previousEntries);
      console.error('Error saving journal entry:', error);
      toast.error(error.message || 'Failed to save journal entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    // Store previous state for rollback
    const previousEntries = [...entries];
    
    try {
      // Optimistically remove the entry
      setEntries(entries.filter(entry => entry.id !== id));
      
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Entry deleted successfully');
    } catch (error: any) {
      // Revert optimistic delete on error
      setEntries(previousEntries);
      console.error('Error deleting entry:', error);
      toast.error(error.message || 'Failed to delete entry');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
          
          // Create preview URL
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          const newPreviewUrl = URL.createObjectURL(audioBlob);
          setPreviewUrl(newPreviewUrl);
          setAudioChunks(chunks);

          // Don't upload to storage yet - wait for user confirmation
          toast.success('Recording completed. Preview your audio before saving.');
        } catch (error: any) {
          console.error('Error creating audio preview:', error);
          toast.error(error.message || 'Failed to create audio preview');
        } finally {
          // Clean up the media stream
          stream.getTracks().forEach(track => track.stop());
          // Reset recording duration
          setRecordingDuration(0);
          if (recordingTimer) {
            clearInterval(recordingTimer);
            setRecordingTimer(null);
          }
        }
      };

      recorder.onerror = (e) => {
        console.error('Recorder error:', e);
        toast.error('Error recording voice note');
        stream.getTracks().forEach(track => track.stop());
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
        setRecordingDuration(0);
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start duration timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= MAX_RECORDING_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      setRecordingTimer(timer);

    } catch (error: any) {
      console.error('Error starting recording:', error);
      toast.error(error.message || 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Clean up the media stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      // Clear recording timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setRecordingDuration(0);
    }
  };

  const saveVoiceNote = async () => {
    if (!audioChunks.length) return;

    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
      const fileName = `voice-note-${Date.now()}.webm`;
      const file = new File([audioBlob], fileName, { type: 'audio/webm' });

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(`${user?.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voice-notes')
        .getPublicUrl(`${user?.id}/${fileName}`);

      // Update the newEntry state with the voice note URL
      setNewEntry(prev => ({ ...prev, voice_note_url: publicUrl }));

      // Clean up preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setAudioChunks([]);

      return publicUrl; // Return the URL for use in handleSubmit
    } catch (error: any) {
      console.error('Error saving voice note:', error);
      toast.error(error.message || 'Failed to save voice note');
      throw error; // Re-throw to be caught by handleSubmit
    }
  };

  const discardRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAudioChunks([]);
    toast.success('Recording discarded');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => entry.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500">Loading journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <SEO 
        title="Journal - Look Back"
        description="Your personal digital journal for capturing daily thoughts, memories, and reflections."
        type="article"
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Journal
            </h1>
            <p className="mt-2 text-gray-600">Capture your thoughts and memories</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Entry
          </button>
        </div>

        {showForm && (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newEntry.entry_date}
                  onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-1">
                  Content
                </label>
                <RichTextEditor
                  content={newEntry.content || ''}
                  onChange={(content) => setNewEntry({ ...newEntry, content })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, mood })}
                      className={`p-3 text-2xl rounded-xl transition-all duration-200 ${
                        newEntry.mood === mood
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg scale-110'
                          : 'bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:scale-105 border border-white/20'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-1">
                  Tags
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)"
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const tag = input.value.trim();
                        if (tag && !newEntry.tags?.includes(tag)) {
                          setNewEntry({
                            ...newEntry,
                            tags: [...(newEntry.tags || []), tag]
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {newEntry.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/20 text-indigo-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setNewEntry({
                          ...newEntry,
                          tags: newEntry.tags?.filter(t => t !== tag)
                        })}
                        className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isRecording
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-white/20'
                  }`}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {isRecording ? `Stop (${formatDuration(recordingDuration)})` : 'Record Voice Note'}
                </button>

                {previewUrl && (
                  <div className="flex-1 space-y-2">
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 voice-note-container">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Mic className="h-4 w-4 text-indigo-600" />
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                            Voice Note Preview
                          </span>
                        </div>
                        <div className="waveform-bars">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                          ))}
                        </div>
                      </div>
                      <audio src={previewUrl} controls className="audio-player w-full" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={discardRecording}
                        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={saveVoiceNote}
                        className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md"
                      >
                        Save Recording
                      </button>
                    </div>
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newEntry.is_private}
                    onChange={(e) => setNewEntry({ ...newEntry, is_private: e.target.checked })}
                    className="rounded border-gray-200 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Private Entry</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setNewEntry({
                      entry_date: format(new Date(), 'yyyy-MM-dd'),
                      content: '',
                      mood: '',
                      tags: [],
                      is_private: true,
                      metadata: { attachments: [] }
                    });
                  }}
                  className="px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl text-gray-700 hover:bg-white/80 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-8">
          <div className="space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-xl"></div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border-0 rounded-full shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition-all duration-300 hover:shadow-xl hover:bg-white/90 text-center"
                placeholder="Search entries..."
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                <Search className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(entries.flatMap(entry => entry.tags || []))).map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-white/50 backdrop-blur-sm border border-white/20 text-gray-700 hover:bg-white/80 hover:text-indigo-600 shadow-sm hover:shadow-md hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>{tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="masonry-grid columns-1 md:columns-2 lg:columns-3 gap-6">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => {
              const entryDate = parseISO(entry.entry_date);
              const showDateHeader = index === 0 || 
                format(entryDate, 'MMMM yyyy') !== format(parseISO(filteredEntries[index - 1].entry_date), 'MMMM yyyy');

              return (
                <React.Fragment key={entry.id}>
                  {showDateHeader && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="break-inside-avoid mb-6 text-center"
                    >
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        {format(entryDate, 'MMMM yyyy')}
                      </h2>
                    </motion.div>
                  )}
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`break-inside-avoid mb-6 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden ${
                      entry.is_private ? 'border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <span className="text-2xl animate-pulse filter drop-shadow-lg">{entry.mood}</span>
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 text-transparent bg-clip-text">
                              {format(entryDate, 'EEEE, MMMM d')}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                              {entry.updated_at !== entry.created_at && (
                                <span className="ml-2 text-xs text-indigo-500">(edited)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {entry.is_private ? (
                            <div className="relative group">
                              <Lock className="h-5 w-5 text-indigo-500" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Private
                              </span>
                            </div>
                          ) : (
                            <div className="relative group">
                              <Unlock className="h-5 w-5 text-green-500" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Public
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div 
                        className="prose prose-indigo max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                      />

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 border border-indigo-100 hover:shadow-md transition-all duration-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.voice_note_url && (
                        <div className="mb-4">
                          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 voice-note-container">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="relative">
                                  <Mic className="h-4 w-4 text-indigo-600" />
                                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                                  Voice Note
                                </span>
                              </div>
                              <div className="waveform-bars">
                                {[...Array(8)].map((_, i) => (
                                  <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                              </div>
                            </div>
                            <audio 
                              src={entry.voice_note_url} 
                              controls 
                              className="audio-player w-full"
                              onPlay={(e) => {
                                const target = e.target as HTMLAudioElement;
                                target.closest('.voice-note-container')?.classList.add('playing');
                              }}
                              onPause={(e) => {
                                const target = e.target as HTMLAudioElement;
                                target.closest('.voice-note-container')?.classList.remove('playing');
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-pink-500 transition-colors group">
                            <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span>0</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-indigo-500 transition-colors group">
                            <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span>0</span>
                          </button>
                          {!entry.is_private && (
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-500 transition-colors group">
                              <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setNewEntry(entry);
                              setShowForm(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-white/20">
              <Calendar className="mx-auto h-12 w-12 text-indigo-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">No journal entries</h3>
              <p className="mt-2 text-gray-600">Start writing your thoughts and memories.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
