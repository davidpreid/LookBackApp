import React, { useState, useEffect } from 'react';
import { Star, Tag, Calendar, Share2, Heart, ChevronLeft, ChevronRight, Sparkles, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';

interface Memory {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  metadata: {
    rating?: number;
    tags?: string[];
    attachments?: {
      url: string;
      type: 'image' | 'video' | 'audio';
      name: string;
    }[];
  };
}

export default function PublicBoard() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMemories, setFeaturedMemories] = useState<Memory[]>([]);
  const [filter, setFilter] = useState<'recent' | 'popular'>('recent');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const onSelect = () => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  };

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    fetchPublicMemories();
  }, [filter]);

  const fetchPublicMemories = async () => {
    try {
      let query = supabase
        .from('memories')
        .select(`
          *
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filter === 'popular') {
        query = query.order('metadata->rating', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      const allMemories = data || [];
      setMemories(allMemories);
      
      // Set featured memories (those with high ratings or many interactions)
      const featured = allMemories
        .filter(memory => 
          (memory.metadata.rating && memory.metadata.rating >= 4) ||
          (memory.metadata.tags && memory.metadata.tags.length >= 3) ||
          (memory.metadata.attachments && memory.metadata.attachments.length >= 2)
        )
        .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0))
        .slice(0, 5);
      
      setFeaturedMemories(featured);
      
      // Fetch profiles for each memory
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', data?.map(m => m.user_id) || []);

      if (profileError) throw profileError;

      // Update memories with profile information
      setMemories(data?.map(memory => ({
        ...memory,
        profiles: profiles?.find(p => p.id === memory.user_id)
      })) || []);
      
    } catch (error) {
      console.error('Error fetching public memories:', error);
      toast.error('Failed to load public memories');
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500">Loading public memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Public Memory Board - Look Back"
        description="Explore publicly shared memories from the Look Back community."
        type="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Memories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore heartfelt moments and inspiring stories shared by our community
          </p>
        </div>

        {/* Featured Memories Carousel */}
        {featuredMemories.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Award className="h-6 w-6 text-amber-500 mr-2" />
                Featured Memories
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={scrollPrev}
                  className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-indigo-600 transition-all duration-200"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={scrollNext}
                  className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-indigo-600 transition-all duration-200"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {featuredMemories.map((memory) => (
                  <div key={memory.id} className="flex-[0_0_100%] min-w-0 pl-4 sm:pl-8">
                    <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <Sparkles className="h-6 w-6 text-amber-500" />
                          <span className="text-lg font-semibold text-gray-900">Featured Memory</span>
                        </div>
                        {memory.metadata.rating && (
                          <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                            <span className="text-amber-700 font-medium">{memory.metadata.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{memory.title}</h3>
                      <p className="text-gray-600 mb-6 text-lg">{memory.content}</p>
                      
                      {memory.metadata.attachments?.map((attachment, index) => (
                        <div key={index} className="mb-6">
                          {attachment.type === 'image' && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                              <img
                                src={attachment.url}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {memory.metadata.tags && memory.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {memory.metadata.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(memory.created_at), 'PPP')}
                        </div>
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-2" />
                          Shared by {memory.profiles?.full_name || 'Anonymous'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 transition-all duration-200 ${
                    index === selectedIndex
                      ? 'bg-indigo-600 w-4'
                      : 'bg-gray-300 hover:bg-indigo-400'
                  }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                filter === 'recent'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              <Calendar className="h-4 w-4 inline-block mr-2" />
              Most Recent
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                filter === 'popular'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline-block mr-2" />
              Most Popular
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="group bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-white/60"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-semibold text-gray-900">{memory.title}</h4>
                {memory.metadata.rating && (
                  <div className="flex items-center">
                    <div className="flex items-center bg-amber-100 px-2 py-0.5 rounded-full">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="ml-1 text-sm font-medium text-amber-700">{memory.metadata.rating}</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-4">{memory.content}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 capitalize">
                  {formatCategoryName(memory.category)}
                </span>
              </div>

              {memory.metadata.attachments?.map((attachment, index) => (
                <div key={`${memory.id}-attach-${index}`} className="mb-4">
                  {attachment.type === 'image' && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
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
                      className="w-full rounded-md"
                    />
                  )}
                  {attachment.type === 'audio' && (
                    <audio src={attachment.url} controls className="w-full" />
                  )}
                </div>
              ))}

              {memory.metadata.tags && memory.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {memory.metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 group-hover:bg-indigo-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(memory.created_at), 'PPP')}
                </div>
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  {memory.profiles?.full_name || 'Anonymous'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {memories.length === 0 && (
          <div className="text-center py-16">
            <Heart className="mx-auto h-16 w-16 text-gray-400 animate-pulse" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">No public memories yet</h3>
            <p className="mt-2 text-gray-600">
              Share your first memory and inspire others in the community!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}