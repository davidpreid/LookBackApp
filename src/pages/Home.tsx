import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Shield, BarChart, Sparkles, Heart, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO />
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full blur-3xl opacity-20 -z-10" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full blur-3xl opacity-20 -z-10" />
          
          <div>
            <div className="text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-['Inter']">
                <span className="block mb-2 font-['Inter'] tracking-tighter">Preserve Your Memories</span>
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-normal">
                  Share Your Legacy
                </span>
              </h1>
              <p className="mt-6 text-base text-gray-600 sm:text-lg md:mt-8 md:text-xl">
                Create meaningful digital time capsules, track your life's journey, and ensure your memories live on. With advanced analytics and customizable highlights, your story is beautifully preserved for generations.
              </p>
              <div className="mt-8 sm:flex sm:justify-start md:mt-10">
                {!user && (
                  <>
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                      >
                        Sign In
                      </Link>
                    </div>
                  </>
                )}
                {user && (
                  <div className="rounded-md shadow">
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Timeline Preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 backdrop-blur-sm"></div>
            <img
              src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=2400&q=80"
              alt="Look Back Timeline Interface"
              className="w-full rounded-2xl shadow-lg border border-white/20 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Beautiful Timeline Interface</h3>
              <p className="text-white/90">Organize your memories chronologically with our intuitive timeline view</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white bg-opacity-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Your Memories</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need to preserve and share your life's journey</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl transform group-hover:scale-105 transition-all duration-200" />
              <div className="relative p-6 bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all duration-200">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Smart Memory Organization</h3>
                <p className="mt-2 text-gray-600">
                  Intelligently categorize and tag your memories with our enhanced organization system.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl transform group-hover:scale-105 transition-all duration-200" />
              <div className="relative p-6 bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 transition-all duration-200">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Interactive Timeline</h3>
                <p className="mt-2 text-gray-600">
                  Visualize your journey with customizable highlights and beautiful themes.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl transform group-hover:scale-105 transition-all duration-200" />
              <div className="relative p-6 bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-100 hover:border-pink-200 transition-all duration-200">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white mb-4">
                  <BarChart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Insightful Analytics</h3>
                <p className="mt-2 text-gray-600">
                  Gain deep insights into your activities with detailed charts and trends.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-100 to-indigo-100 rounded-2xl transform group-hover:scale-105 transition-all duration-200" />
              <div className="relative p-6 bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-100 hover:border-rose-200 transition-all duration-200">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-indigo-500 text-white mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Legacy Protection</h3>
                <p className="mt-2 text-gray-600">
                  Ensure your memories are preserved and shared with future generations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Features Highlight */}
      <div className="py-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">New & Enhanced Features</h2>
            <p className="mt-4 text-lg text-indigo-100">Discover the latest additions to make your memories even more special</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* New Feature 1 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Custom Themes</h3>
                  <p className="mt-2 text-indigo-100">
                    Personalize your timeline with beautiful themes and visual styles.
                  </p>
                </div>
              </div>
            </div>

            {/* New Feature 2 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Heart className="h-6 w-6 text-pink-200" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Memory Stickers</h3>
                  <p className="mt-2 text-indigo-100">
                    Add fun stickers and emojis to make your memories more expressive.
                  </p>
                </div>
              </div>
            </div>

            {/* New Feature 3 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Share2 className="h-6 w-6 text-purple-200" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Enhanced Sharing</h3>
                  <p className="mt-2 text-indigo-100">
                    Share memories with specific people or make them public for all to see.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}