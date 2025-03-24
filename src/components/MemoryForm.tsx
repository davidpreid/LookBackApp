import React, { useState, useEffect, useRef } from 'react';
import { Star, Tag, Paperclip, Sticker, List, CheckSquare, Image, Upload, X, Mic, ChefHat, PartyPopper, Plane, Trophy, Trash2, ChevronDown, Lock, Gift } from 'lucide-react';
import { CategoryMetadata, MemoryFormData, Attachment } from '../types';
import StickerPicker from './StickerPicker';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import * as tus from 'tus-js-client';
import VoiceRecorder from './VoiceRecorder';
import { format, add } from 'date-fns';

interface MemoryTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  content: string;
  metadata: {
    tags: string[];
    sections: {
      name: string;
      type: 'text' | 'list' | 'checkbox';
      placeholder?: string;
      content?: string | string[];
    }[];
  };
}

interface MemoryFormProps {
  initialData?: MemoryFormData;
  isEditing?: boolean;
  onSubmit: (data: MemoryFormData) => Promise<void>;
  onCancel: () => void;
  template?: MemoryTemplate | null;
  categories: {
    category: string;
    icon_name: string;
    color: string;
    description: string;
  }[];
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_AUDIO_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadProgressEvent {
  bytesUploaded: number;
  bytesTotal: number;
}

export const MEMORY_TEMPLATES: MemoryTemplate[] = [
  {
    id: 'recipe',
    name: 'Recipe',
    icon: <ChefHat className="h-6 w-6" />,
    category: 'food',
    title: 'New Recipe',
    content: 'Write about your cooking experience...',
    metadata: {
      tags: ['recipe', 'cooking'],
      sections: [
        {
          name: 'Ingredients',
          type: 'list',
          placeholder: 'Add an ingredient'
        },
        {
          name: 'Instructions',
          type: 'list',
          placeholder: 'Add a step'
        },
        {
          name: 'Cooking Time',
          type: 'text',
          placeholder: 'How long did it take to prepare?'
        },
        {
          name: 'Difficulty Level',
          type: 'text',
          placeholder: 'Easy, Medium, or Hard'
        },
        {
          name: 'Success Rating',
          type: 'text',
          placeholder: 'How did it turn out? (1-5 stars)'
        }
      ]
    }
  },
  {
    id: 'special-occasion',
    name: 'Special Occasion',
    icon: <PartyPopper className="h-6 w-6" />,
    category: 'celebration',
    title: 'Special Day',
    content: 'Capture the details of this special moment...',
    metadata: {
      tags: ['celebration', 'special'],
      sections: [
        {
          name: 'Event Type',
          type: 'text',
          placeholder: 'Birthday, Anniversary, etc.'
        },
        {
          name: 'People Present',
          type: 'list',
          placeholder: 'Add a person'
        },
        {
          name: 'Highlights',
          type: 'list',
          placeholder: 'Add a memorable moment'
        },
        {
          name: 'Gifts',
          type: 'list',
          placeholder: 'Add a gift received/given'
        }
      ]
    }
  },
  {
    id: 'travel',
    name: 'Travel Memory',
    icon: <Plane className="h-6 w-6" />,
    category: 'travel',
    title: 'Travel Adventure',
    content: 'Document your journey and experiences...',
    metadata: {
      tags: ['travel', 'adventure'],
      sections: [
        {
          name: 'Destination',
          type: 'text',
          placeholder: 'Where did you go?'
        },
        {
          name: 'Places Visited',
          type: 'list',
          placeholder: 'Add a place you visited'
        },
        {
          name: 'Activities',
          type: 'list',
          placeholder: 'Add an activity'
        },
        {
          name: 'Food Highlights',
          type: 'list',
          placeholder: 'Add a memorable meal or dish'
        },
        {
          name: 'Travel Tips',
          type: 'list',
          placeholder: 'Add a useful tip'
        }
      ]
    }
  },
  {
    id: 'achievement',
    name: 'Achievement',
    icon: <Trophy className="h-6 w-6" />,
    category: 'milestone',
    title: 'Personal Achievement',
    content: 'Record your accomplishment...',
    metadata: {
      tags: ['achievement', 'milestone'],
      sections: [
        {
          name: 'Achievement Type',
          type: 'text',
          placeholder: 'Academic, Professional, Personal, etc.'
        },
        {
          name: 'Goals Met',
          type: 'list',
          placeholder: 'Add a goal you achieved'
        },
        {
          name: 'Challenges Overcome',
          type: 'list',
          placeholder: 'Add a challenge you faced'
        },
        {
          name: 'Next Steps',
          type: 'list',
          placeholder: 'Add your next goal'
        }
      ]
    }
  }
];

const addTime = (date: Date, period: string): Date => {
  if (!period || typeof period !== 'string') {
    return date;
  }
  
  const value = parseInt(period);
  const unit = period.slice(-1);
  
  switch(unit) {
    case 'm':
      return add(date, { months: value });
    case 'y':
      return add(date, { years: value });
    default:
      return date;
  }
};

export default function MemoryForm({ 
  initialData, 
  isEditing = false, 
  onSubmit, 
  onCancel,
  template,
  categories
}: MemoryFormProps) {
  const initialFormData: MemoryFormData = {
    id: '',
    title: '',
    content: '',
    category: 'movie',
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
  };

  const [formData, setFormData] = useState<MemoryFormData>(() => {
    if (initialData) {
      return {
        ...initialFormData,
        ...initialData,
        metadata: {
          ...(initialData.metadata || {}),
          lockPeriod: initialData.metadata?.lockPeriod || '1y',
          isAnimated: initialData.metadata?.isAnimated || false
        }
      };
    }
    return initialFormData;
  });

  const [newTag, setNewTag] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'audio'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [newListItems, setNewListItems] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddAttachment = () => {
    if (attachmentUrl.trim()) {
      setFormData({
        ...formData,
        attachments: [
          ...formData.attachments,
          {
            url: attachmentUrl.trim(),
            type: attachmentType,
            name: attachmentUrl.split('/').pop() || 'attachment'
          }
        ]
      });
      setAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = async (attachment: { url: string, path?: string }) => {
    if (!attachment.path) {
      // Handle old attachments without path
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a => a.url !== attachment.url)
      }));
      return;
    }

    try {
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('memories')
        .remove([attachment.path]);

      if (error) throw error;

      // Remove from form data
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a => a.url !== attachment.url)
      }));

      toast.success('Attachment removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove attachment');
    }
  };

  const handleAddSticker = (sticker: string) => {
    setFormData({
      ...formData,
      stickers: [...formData.stickers, sticker]
    });
    setShowStickerPicker(false);
  };

  const handleRemoveSticker = (stickerToRemove: string) => {
    setFormData({
      ...formData,
      stickers: formData.stickers.filter(sticker => sticker !== stickerToRemove)
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isAudio = ACCEPTED_AUDIO_TYPES.includes(file.type);
    if (!isImage && !isAudio) {
      toast.error('Invalid file type. Please upload an image or audio file.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const bucket = isImage ? 'images' : 'audio';

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      // Create upload
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: bucket,
            objectName: fileName,
            contentType: file.type,
            cacheControl: '3600',
          },
          chunkSize: 6 * 1024 * 1024, // 6MB chunks
          onError: (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            setUploadProgress(parseFloat(percentage));
          },
          onSuccess: () => {
            resolve();
          },
        });

        // Start the upload
        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }
          upload.start();
        });
      });

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Add to form data
      setFormData(prev => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          {
            url: publicUrl,
            type: isImage ? 'image' : 'audio',
            name: file.name
          }
        ]
      }));

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateSection = (sectionName: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.name === sectionName
          ? { ...section, content: value }
          : section
      )
    }));
  };

  const handleAddListItem = (sectionName: string, item: string) => {
    if (!item.trim()) return;

    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.name === sectionName && section.type === 'list'
          ? {
              ...section,
              content: [...(section.content as string[]), item.trim()]
            }
          : section
      )
    }));
  };

  const handleRemoveListItem = (sectionName: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.name === sectionName && section.type === 'list'
          ? {
              ...section,
              content: (section.content as string[]).filter((_, i) => i !== index)
            }
          : section
      )
    }));
  };

  const handleVoiceRecordingSave = (audioBlob: Blob) => {
    setVoiceNote(audioBlob);
    setShowVoiceRecorder(false);
    // Add the voice note to the attachments
    const voiceNoteURL = URL.createObjectURL(audioBlob);
    const newAttachment: Attachment = {
      type: 'audio',
      url: voiceNoteURL,
      name: `Voice Note - ${new Date().toLocaleString()}`,
      blob: audioBlob
    };
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      {/* Time Capsule Details Section */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Time Capsule Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.capsule_name}
                onChange={(e) => setFormData({ ...formData, capsule_name: e.target.value })}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm 
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         hover:bg-gray-50 transition-all duration-300"
                placeholder="Give your capsule a meaningful name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Lock Period
            </label>
            <div className="relative">
              <select
                value={formData.metadata.lockPeriod}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, lockPeriod: e.target.value }
                })}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm 
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         hover:bg-gray-50 transition-all duration-300 appearance-none"
              >
                <option value="1m">1 Month</option>
                <option value="3m">3 Months</option>
                <option value="6m">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="2y">2 Years</option>
                <option value="5y">5 Years</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Description
          </label>
          <div className="relative">
            <textarea
              value={formData.capsule_description}
              onChange={(e) => setFormData({ ...formData, capsule_description: e.target.value })}
              className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       hover:bg-gray-50 transition-all duration-300"
              placeholder="What makes this time capsule special?"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-900">Time Capsule Lock</h3>
            <p className="text-sm text-amber-700">
              This capsule will be locked until {format(addTime(new Date(), formData.metadata.lockPeriod), 'PPP')}
            </p>
          </div>
        </div>
      </div>

      {/* Memory Content Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="h-8 w-8 text-indigo-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Memory Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input bg-white w-full"
              placeholder="Give your memory a title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="input bg-white w-full"
            >
              {categories.map(cat => (
                <option key={cat.category} value={cat.category}>
                  {cat.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            className="input bg-white w-full"
            placeholder="Write your memory here..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input bg-white w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input bg-white w-full"
              placeholder="Where did this memory take place?"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mood & Stickers</label>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              className="input bg-white w-full"
              placeholder="How are you feeling?"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowStickerPicker(!showStickerPicker)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 
                         rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                <Sticker className="h-4 w-4" />
                <span>Add Stickers</span>
              </button>
            </div>
            {showStickerPicker && (
              <div className="relative">
                <div className="absolute z-10 mt-2 bg-white rounded-xl shadow-xl border border-gray-200">
                  <StickerPicker
                    onSelect={handleAddSticker}
                    selectedStickers={formData.stickers}
                  />
                </div>
              </div>
            )}
            {formData.stickers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.stickers.map((sticker, index) => (
                  <span
                    key={`${sticker}-${index}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 
                           hover:bg-indigo-100 cursor-pointer transition-colors"
                    onClick={() => handleRemoveSticker(sticker)}
                    title="Click to remove"
                  >
                    {sticker}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag"
                className="input bg-white flex-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl 
                         hover:bg-indigo-700 transition-colors"
              >
                <Tag className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium 
                           bg-indigo-50 text-indigo-600"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-800 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 
                           rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors flex-1"
                  disabled={isUploading}
                >
                  <Image className="h-5 w-5" />
                  Upload Photos
                </button>
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 
                           rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors flex-1"
                >
                  <Mic className="h-5 w-5" />
                  Add Voice Note
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Photos (JPG, PNG, GIF, WebP) or voice notes (WAV, MP3, WebM) up to 5MB
              </p>
            </div>

            {isUploading && (
              <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {showVoiceRecorder && (
              <VoiceRecorder
                onSave={handleVoiceRecordingSave}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence>
                {formData.attachments.map((attachment, index) => (
                  <motion.div
                    key={`${attachment.url}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group rounded-xl overflow-hidden bg-gray-50 aspect-square"
                  >
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    ) : attachment.type === 'audio' ? (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <audio
                          src={attachment.url}
                          controls
                          className="w-full"
                        />
                      </div>
                    ) : null}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => handleRemoveAttachment(attachment)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {formData.sections.map((section, index) => (
          <div key={`${section.name}-${index}`} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{section.name}</label>
            {section.type === 'text' ? (
              <input
                type="text"
                value={section.content as string}
                onChange={(e) => handleUpdateSection(section.name, e.target.value)}
                placeholder={section.placeholder}
                className="input bg-white w-full"
              />
            ) : section.type === 'list' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newListItems[section.name] || ''}
                    onChange={(e) => setNewListItems(prev => ({
                      ...prev,
                      [section.name]: e.target.value
                    }))}
                    placeholder={section.placeholder}
                    className="input bg-white flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddListItem(section.name, newListItems[section.name] || '');
                        setNewListItems(prev => ({ ...prev, [section.name]: '' }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddListItem(section.name, newListItems[section.name] || '');
                      setNewListItems(prev => ({ ...prev, [section.name]: '' }));
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl 
                             hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(section.content as string[]).map((item, itemIndex) => (
                    <div
                      key={`${section.name}-item-${itemIndex}`}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
                    >
                      <span className="text-gray-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveListItem(section.name, itemIndex)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700
                   hover:bg-gray-50 transition-all duration-200"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
                     text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50
                     transition-all duration-300 hover:translate-y-[-1px]"
          >
            <Gift className="h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Time Capsule'}
          </button>
        </div>
      </div>
    </form>
  );
}