import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star, Tag, Paperclip, Edit2, Save, X, Palette, Image, Sticker, Clock, Grid, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { format, startOfYear, endOfYear, getYear, parseISO, isSameDay } from 'date-fns';

interface Memory {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  shared_with?: string[];
  is_public?: boolean;
  metadata: {
    rating?: number;
    tags?: string[];
    attachments?: {
      url: string;
      type: 'image' | 'video' | 'audio';
      name: string;
    }[];
    theme?: {
      color?: string;
      font?: string;
      stickers?: string[];
      background?: string;
    };
  };
}

interface YearSummary {
  year: number;
  totalMemories: number;
  highlightMemories: Memory[];
  categories: Record<string, number>;
}

interface YearlyHighlight {
  id: string;
  year: number;
  highlights: Memory[];
  custom_highlights: Memory[];
  is_customized: boolean;
  theme?: {
    color: string;
    font: string;
    background: string;
  };
}

const THEMES = {
  default: {
    color: '#4F46E5',
    font: 'Inter',
    background: 'bg-white'
  },
  vintage: {
    color: '#B45309',
    font: 'Playfair Display',
    background: 'bg-amber-50'
  },
  modern: {
    color: '#0F172A',
    font: 'Montserrat',
    background: 'bg-slate-50'
  },
  nature: {
    color: '#047857',
    font: 'Lora',
    background: 'bg-emerald-50'
  },
  minimal: {
    color: '#1F2937',
    font: 'DM Sans',
    background: 'bg-gray-50'
  }
};

const STICKERS = [
  '🌟', '❤️', '🎉', '🎂', '🎁', '🌈', '✨', '🎵', '🎬', '📚',
  '✈️', '🌍', '🏆', '🎨', '📸', '🎮', '⚽', '🎭', '🍕', '🌺'
];

export default function Timeline() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearSummaries, setYearSummaries] = useState<YearSummary[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'collage'>('timeline');
  const [yearlyHighlights, setYearlyHighlights] = useState<YearlyHighlight[]>([]);
  const [editingHighlights, setEditingHighlights] = useState<number | null>(null);
  const [selectedMemories, setSelectedMemories] = useState<Memory[]>([]);
  const [showMemorySelector, setShowMemorySelector] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, { full_name: string }>>({});

  useEffect(() => {
    if (user) {
      fetchMemories();
      fetchYearlyHighlights();
    }
  }, [user]);

  useEffect(() => {
    if (memories.length > 0) {
      fetchUserProfiles();
    }
  }, [memories]);

  const fetchUserProfiles = async () => {
    try {
      const userIds = [...new Set(memories.map(m => m.user_id))];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (error) throw error;

      const profileMap = (data || []).reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile
      }), {});

      setUserProfiles(profileMap);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
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
      setMemories(data || []);
      generateYearSummaries(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Error fetching memories');
    } finally {
      setLoading(false);
    }
  };

  const generateYearSummaries = (memories: Memory[]) => {
    const summaries: YearSummary[] = [];
    const years = [...new Set(memories.map(m => getYear(new Date(m.created_at))))];

    years.forEach(year => {
      const yearMemories = memories.filter(m => getYear(new Date(m.created_at)) === year);
      const categoryCount: Record<string, number> = {};
      
      yearMemories.forEach(memory => {
        categoryCount[memory.category] = (categoryCount[memory.category] || 0) + 1;
      });

      const highlightMemories = yearMemories
        .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0))
        .slice(0, 3);

      summaries.push({
        year,
        totalMemories: yearMemories.length,
        highlightMemories,
        categories: categoryCount
      });
    });

    setYearSummaries(summaries.sort((a, b) => b.year - a.year));
  };

  const fetchYearlyHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('yearly_highlights')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setYearlyHighlights(data || []);
    } catch (error) {
      toast.error('Error fetching yearly highlights');
    }
  };

  const renderHighlightSection = (year: number) => {
    const yearHighlight = yearlyHighlights.find(h => h.year === year);
    const highlights = yearHighlight?.is_customized
      ? yearHighlight.custom_highlights
      : yearHighlight?.highlights || [];
    const theme = yearHighlight?.theme || THEMES.default;

    return (
      <div className="mt-8 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        <div className="p-8 border-b border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Year {year}</h3>
              <p className="mt-2 text-gray-600">Most memorable moments</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories
              .filter(memory => getYear(new Date(memory.created_at)) === year)
              .map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-semibold text-gray-900">{memory.title}</h4>
                    {memory.metadata.rating && (
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm">{memory.metadata.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">{memory.content}</p>

                  {memory.metadata.tags && memory.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {memory.metadata.tags.map((tag, index) => (
                        <span
                          key={`${memory.id}-tag-${index}`}
                          className="px-3 py-1.5 text-sm rounded-xl bg-white/50 backdrop-blur-sm text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    {format(new Date(memory.created_at), 'MMMM d, yyyy')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <SEO 
        title="Memory Timeline - Look Back"
        description="Explore your memories through an interactive timeline. View highlights and milestones from your life journey."
        type="article"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Memory Timeline
            </h1>
            <p className="mt-2 text-gray-600">Explore your journey through time</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200
                ${viewMode === 'timeline'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
            >
              <List className="h-5 w-5" />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200
                ${viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
            >
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('collage')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200
                ${viewMode === 'collage'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
            >
              <Grid className="h-5 w-5" />
              Collage
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="ml-3 text-gray-600">Loading memories...</p>
            </div>
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  {selectedYear}
                </h2>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(selectedYear, i);
                const monthMemories = memories.filter(m => {
                  const memoryDate = new Date(m.created_at);
                  return memoryDate.getMonth() === i && getYear(memoryDate) === selectedYear;
                });

                const ownMemories = monthMemories.filter(m => m.user_id === user?.id);
                const sharedMemories = monthMemories.filter(m => m.user_id !== user?.id);

                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-xl border transition-all duration-300
                      ${monthMemories.length > 0
                        ? 'bg-white/60 backdrop-blur-sm border-white/40 hover:shadow-lg hover:scale-[1.02]'
                        : 'bg-gray-50/60 backdrop-blur-sm border-gray-100'
                      }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
                    <div className="relative p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {format(date, 'MMMM')}
                      </h3>
                      
                      {monthMemories.length > 0 ? (
                        <div className="space-y-3">
                          {ownMemories.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                              <p className="text-sm text-gray-700">
                                {ownMemories.length} own {ownMemories.length === 1 ? 'memory' : 'memories'}
                              </p>
                            </div>
                          )}
                          {sharedMemories.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                              <p className="text-sm text-gray-700">
                                {sharedMemories.length} shared {sharedMemories.length === 1 ? 'memory' : 'memories'}
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-3 space-y-2">
                            {monthMemories.slice(0, 3).map(memory => (
                              <div
                                key={memory.id}
                                className="text-sm truncate text-gray-600 hover:text-gray-900 transition-colors"
                                title={memory.title}
                              >
                                {format(new Date(memory.created_at), 'd')} - {memory.title}
                              </div>
                            ))}
                            {monthMemories.length > 3 && (
                              <div className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                                +{monthMemories.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No memories</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === 'collage' ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden p-6">
            {memories.length > 0 ? (
              memories.reduce((acc, memory) => {
                const photos = memory.metadata.attachments?.filter(a => a.type === 'image').map(a => a.url) || [];
                return [...acc, ...photos]; 
              }, [] as string[]).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px]">
                  {memories.reduce((acc, memory) => {
                    const photos = memory.metadata.attachments?.filter(a => a.type === 'image').map(a => a.url) || [];
                    return [...acc, ...photos];
                  }, [] as string[])
                  .slice(0, 6)
                  .map((url, index) => (
                    <div 
                      key={url}
                      className={`relative overflow-hidden rounded-xl border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                        index === 0 ? 'col-span-2 row-span-2' : ''
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/0"></div>
                      <img
                        src={url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image className="mx-auto h-12 w-12 text-indigo-300" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">No photos found</h3>
                  <p className="mt-2 text-gray-600">Add some memories with photos to see them in the collage view.</p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-indigo-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">No memories yet</h3>
                <p className="mt-2 text-gray-600">Start adding memories to see them on your timeline.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-1/2 -ml-0.5 w-0.5 h-full bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200"></div>
            <div className="space-y-12">
              {memories
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((memory, index) => (
                <div key={memory.id} className="relative">
                  {/* Date marker */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 border-4 border-white shadow-lg"></div>
                  
                  {/* Memory card */}
                  <div className={`flex ${index % 2 === 0 ? 'justify-end pl-8' : 'justify-start pr-8'} w-1/2 ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                    <div className="relative w-full">
                      {/* Connector line */}
                      <div className={`absolute top-6 ${index % 2 === 0 ? '-left-4' : '-right-4'} w-4 h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200`}></div>
                      
                      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                        <div className="relative">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                              {memory.title}
                            </h4>
                            {memory.metadata.rating && (
                              <div className="flex items-center">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm">{memory.metadata.rating}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4">{memory.content}</p>

                          {memory.metadata.tags && memory.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {memory.metadata.tags.map((tag, tagIndex) => (
                                <span
                                  key={`${memory.id}-tag-${tagIndex}`}
                                  className="px-3 py-1.5 text-sm rounded-xl bg-white/50 backdrop-blur-sm text-gray-700 border border-white/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {memory.metadata.attachments?.map((attachment, attachIndex) => (
                            <div key={`${memory.id}-attach-${attachIndex}`} className="mb-4">
                              {attachment.type === 'image' && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 border border-white/20">
                                  <img
                                    src={attachment.url}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                  />
                                </div>
                              )}
                              {attachment.type === 'video' && (
                                <video
                                  src={attachment.url}
                                  controls
                                  className="w-full rounded-xl border border-white/20"
                                />
                              )}
                              {attachment.type === 'audio' && (
                                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                  <audio src={attachment.url} controls className="w-full" />
                                </div>
                              )}
                            </div>
                          ))}

                          <div className="text-sm text-gray-500">
                            {format(new Date(memory.created_at), 'MMMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {memories.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-white/20">
                    <Clock className="mx-auto h-12 w-12 text-indigo-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">No memories yet</h3>
                    <p className="mt-2 text-gray-600">Start adding memories to see them on your timeline.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}