import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Telescope, Menu, X, Globe, DollarSign, Sparkles, Star, PenTool, BarChart, UserCircle, LogOut, Clock, TimerOff, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPublicBoardHovered, setIsPublicBoardHovered] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still navigate and show success since we cleaned up local state
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl mx-auto bg-white/40 backdrop-blur-lg shadow-lg transition-all duration-300 rounded-2xl border border-white/20">
      <div className="px-3 sm:px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 relative">
              <Telescope className="h-6 w-6 text-indigo-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">Look Back</span>
            </Link>
          </div>

          {/* Floating Public Board Icon */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-6">
            <Link
              to="/public-board"
              onMouseEnter={() => setIsPublicBoardHovered(true)}
              onMouseLeave={() => setIsPublicBoardHovered(false)}
              className={`relative flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                isPublicBoardHovered ? 'scale-110' : ''
              }`}
            >
              <Globe className="h-5 w-5" />
              {isPublicBoardHovered && (
                <span className="ml-2 text-sm font-medium whitespace-nowrap">
                  Public Board
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex-shrink-0 flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                  title="Dashboard"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Dashboard
                  </span>
                </Link>
                <Link
                  to="/timeline"
                  className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                  title="Timeline"
                >
                  <Clock className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Timeline
                  </span>
                </Link>
                <Link
                  to="/analytics"
                  className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                  title="Analytics"
                >
                  <BarChart className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Analytics
                  </span>
                </Link>
                <Link
                  to="/time-capsule"
                  className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                  title="Time Capsule"
                >
                  <TimerOff className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Time Capsule
                  </span>
                </Link>
                <Link
                  to="/journal"
                  className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                  title="Journal"
                >
                  <PenTool className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Journal
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                  title="Profile"
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Profile
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 group relative"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign Out
                  </span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <Link
                    to="/features"
                    className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                    title="Features"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Features
                    </span>
                  </Link>
                  <Link
                    to="/reviews"
                    className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                    title="Reviews"
                  >
                    <Star className="h-5 w-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Reviews
                    </span>
                  </Link>
                  <Link
                    to="/pricing"
                    className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                    title="Pricing"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Pricing
                    </span>
                  </Link>
                </div>
                <Link
                  to="/login"
                  className="p-2 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200 group relative"
                  title="Sign In"
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign In
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 group relative"
                  title="Sign Up"
                >
                  <LogOut className="h-5 w-5 rotate-180" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/80 backdrop-blur-lg rounded-b-2xl border-t border-white/20">
            <div className="pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <History className="h-5 w-5" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <Link
                    to="/time-capsule"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Time Capsule</span>
                    </div>
                  </Link>
                  <Link
                    to="/analytics"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-5 w-5" />
                      <span>Analytics</span>
                    </div>
                  </Link>
                  <Link
                    to="/journal"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <PenTool className="h-5 w-5" />
                      <span>Journal</span>
                    </div>
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <UserCircle className="h-5 w-5" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <Link
                      to="/features"
                      className="block rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>Features</span>
                      </div>
                    </Link>
                    <Link
                      to="/reviews"
                      className="block rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5" />
                        <span>Reviews</span>
                      </div>
                    </Link>
                    <Link
                      to="/pricing"
                      className="block rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Pricing</span>
                      </div>
                    </Link>
                    <Link
                      to="/public-board"
                      className="block rounded-md text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 mt-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5" />
                        <span>Public Board</span>
                      </div>
                    </Link>
                  </div>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}