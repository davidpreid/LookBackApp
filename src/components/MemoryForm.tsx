import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, Tag, Image, X, Mic, Square, Play, Pause, Smile, Link as LinkIcon, Upload } from 'lucide-react';
import { Memory, MemoryFormData, CategoryMetadata } from '../types';
import RichTextEditor from './RichTextEditor';
import StickerPicker from './StickerPicker';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface MemoryFormProps {
  initialData?: MemoryFormData;
  isEditing?: boolean;
  onSubmit: (data: MemoryFormData) => Promise<void>;
  onCancel: () => void;
}

export default function MemoryForm({ initialData, isEditing = false, onSubmit, onCancel }: MemoryFormProps) {
  const [formData, setFormData] = useState<MemoryFormData>(initialData || {
    title: '',
    content: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    mood: '',
    stickers: [],
    tags: [],
    attachments: [],
  });

  const [categories, setCategories] = useState<CategoryMetadata[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('category_metadata')
        .select('*')
        .order('category');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setFormData(prev => ({
          ...prev,
          voiceNote: {
            url: audioUrl,
            duration: recordingDuration,
            blob: audioBlob
          }
        }));
        setIsRecording(false);
        setRecordingDuration(0);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!formData.voiceNote) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    } else if (audioRef.current) {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
      }
      e.currentTarget.value = '';
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Get user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get signed URL that expires in 1 hour
      const { data: signedUrlData } = await supabase.storage
        .from('memory-images')
        .createSignedUrl(filePath, 3600);

      if (!signedUrlData?.signedUrl) {
        throw new Error('Failed to generate signed URL');
      }

      // Add to attachments
      const newAttachment = {
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
        url: signedUrlData.signedUrl,
        path: filePath
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      // Clean up preview URL if upload fails
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl) return;

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    // Add to attachments
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, {
        name: 'External Image',
        type: 'image/jpeg',
        size: 0,
        blob: new Blob(),
        url: imageUrl
      }]
    }));

    setImageUrl('');
    setShowUrlInput(false);
    toast.success('Image URL added successfully');
  };

  const handleAttachmentRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleStickerSelect = (sticker: string) => {
    if (!formData.stickers.includes(sticker)) {
      setFormData({
        ...formData,
        stickers: [...formData.stickers, sticker],
      });
    }
    setShowStickerPicker(false);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getIconComponent = (iconName: string) => {
    // Map icon names to Lucide icons
    const iconMap: { [key: string]: string } = {
      'Film': '🎬',
      'Tv': '📺',
      'Music': '🎵',
      'Headphones': '🎧',
      'BookOpen': '📚',
      'Cake': '🎂',
      'Heart': '❤️',
      'Users': '��',
      'Star': '⭐',
      'Gamepad2': '🎮',
      'Trophy': '🏆',
      'Palette': '🎨',
      'Camera': '📸',
      'Plane': '✈️',
      'Mountain': '🏔️',
      'Building2': '🏛️',
      'Activity': '🏃',
      'Moon': '🌙',
      'Stethoscope': '🏥',
      'Apple': '🍎',
      'Award': '🏅',
      'GraduationCap': '🎓',
      'Coffee': '☕',
      'Party': '🎉',
      'Utensils': '🍽️',
      'ChefHat': '👨‍🍳',
      'UtensilsCrossed': '🍴',
      'Gift': '🎁',
      'PartyPopper': '🎊',
      'Ring': '💍',
      'Church': '⛪',
      'Sparkles': '✨',
      'Zap': '⚡',
      'Pencil': '✏️'
    };
    return iconMap[iconName] || '📝';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Memory Title
          </label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.category}
                type="button"
                onClick={() => setFormData({ ...formData, category: category.category })}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                  formData.category === category.category
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <span style={{ color: category.color }} className="text-lg">
                    {getIconComponent(category.icon_name)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {category.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.category.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Memory Content
          </label>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input bg-white w-full pl-10"
                required
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input bg-white w-full pl-10"
                placeholder="Where did this happen?"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mood & Stickers
          </label>
          <div className="flex items-start gap-4">
            <input
              type="text"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              className="input bg-white flex-1"
              placeholder="How were you feeling?"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStickerPicker(!showStickerPicker)}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Smile className="h-5 w-5 text-gray-600" />
              </button>
              {showStickerPicker && (
                <div className="absolute z-50 right-0 mt-2">
                  <StickerPicker
                    onSelect={handleStickerSelect}
                    selectedStickers={formData.stickers}
                  />
                </div>
              )}
            </div>
          </div>
          {formData.stickers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.stickers.map((sticker, index) => (
                <span
                  key={index}
                  className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setFormData({
                    ...formData,
                    stickers: formData.stickers.filter((_, i) => i !== index)
                  })}
                >
                  {sticker}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium
                         bg-indigo-50 text-indigo-600 border border-indigo-100"
              >
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            onKeyDown={handleTagAdd}
            className="input bg-white w-full"
            placeholder="Add tags (press Enter)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Attachments
          </label>
          <div className="space-y-4">
            {/* Image Previews */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current Upload Preview */}
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )}

              {/* Existing Attachments */}
              {formData.attachments.map((attachment, index) => (
                attachment.type.startsWith('image/') && (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleAttachmentRemove(index)}
                      className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                )
              ))}
            </div>

            {/* URL Input */}
            {showUrlInput && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="input bg-white flex-1"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Upload Controls */}
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LinkIcon className="h-4 w-4" />
                Add URL
              </button>
            </div>

            {/* Attachments List */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <Image className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'External URL'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttachmentRemove(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Voice Note
          </label>
          <div className="space-y-4">
            {formData.voiceNote ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="p-2 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Voice Note</div>
                  <div className="text-sm text-gray-500">{formatDuration(formData.voiceNote.duration)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, voiceNote: undefined }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Record Voice Note
                    </>
                  )}
                </button>
                {isRecording && (
                  <div className="text-sm font-medium text-gray-900">
                    Recording: {formatDuration(recordingDuration)}
                  </div>
                )}
              </div>
            )}
            <audio
              ref={audioRef}
              src={formData.voiceNote?.url}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700
                   hover:bg-gray-50 transition-all duration-200"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
                   text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50
                   transition-all duration-300 hover:translate-y-[-1px]"
        >
          {isEditing ? 'Update Memory' : 'Create Memory'}
        </button>
      </div>
    </form>
  );
}