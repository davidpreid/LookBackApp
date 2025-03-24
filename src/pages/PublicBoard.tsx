import React, { useState, useEffect } from 'react';
import { Star, Tag, Calendar, Share2, Heart, ChevronLeft, ChevronRight, Sparkles, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import MemoryContent from '../components/MemoryContent';
import { Memory } from '../types';

interface PublicMemory extends Memory {
  profiles?: {
    full_name: string;
  };
}

export default function PublicBoard() {
  const [memories, setMemories] = useState<PublicMemory[]>([]);
  const [featuredMemories, setFeaturedMemories] = useState<PublicMemory[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      // First, fetch the memories
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (memoriesError) throw memoriesError;

      // Then, fetch the profiles for all users
      const userIds = [...new Set((memoriesData || []).map(m => m.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profileMap = (profilesData || []).reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile
      }), {});

      // Combine memories with profiles
      const memoriesWithProfiles = (memoriesData || []).map(memory => ({
        ...memory,
        profiles: profileMap[memory.user_id]
      }));

      // Get signed URLs for all attachments
      const memoriesWithSignedUrls = await Promise.all(
        memoriesWithProfiles.map(async (memory) => {
          if (memory.metadata?.attachments) {
            const attachmentsWithUrls = await Promise.all(
              memory.metadata.attachments.map(async (attachment: { path?: string; url?: string; type: string; name: string }) => {
                if (attachment.path) {
                  try {
                    const { data: signedUrlData } = await supabase.storage
                      .from('memory-images')
                      .createSignedUrl(attachment.path, 3600); // URL expires in 1 hour
                    
                    if (!signedUrlData?.signedUrl) {
                      console.error('Failed to generate signed URL for attachment:', attachment.path);
                      return attachment;
                    }
                    
                    return { ...attachment, url: signedUrlData.signedUrl };
                  } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return attachment;
                  }
                }
                return attachment;
              })
            );
            return { ...memory, metadata: { ...memory.metadata, attachments: attachmentsWithUrls } };
          }
          return memory;
        })
      );

      setMemories(memoriesWithSignedUrls);
      setFeaturedMemories(memoriesWithSignedUrls.slice(0, 3));
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Unable to load memories. Please try again.');
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
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
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
                      <MemoryContent memory={memory} className="text-gray-600 mb-6 text-lg" />
                      
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

              <MemoryContent memory={memory} className="text-gray-600 mb-4" />

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