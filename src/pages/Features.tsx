import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Shield, Users, BarChart, Lock, HardDrive, Gift, PenTool, Database, Sparkles } from 'lucide-react';
import SEO from '../../src/components/SEO';

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Features - Look Back"
        description="Explore the powerful features of Look Back. From digital time capsules to secure USB backups, discover how we help preserve your memories."
        type="article"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Your Memories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to preserve and share your life's journey, with advanced security and backup options.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Smart Organization */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Organization</h3>
            <p className="text-gray-600">
              Intelligently categorize and tag your memories with our enhanced organization system. Supports rich media attachments and smart tagging.
            </p>
          </div>

          {/* Time Capsules */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Capsules</h3>
            <p className="text-gray-600">
              Create digital and physical time capsules. Lock away memories with our secure USB drives or digital vaults.
            </p>
          </div>

          {/* Legacy Protection */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Legacy Protection</h3>
            <p className="text-gray-600">
              Ensure your memories live on with our legacy access feature. Set up trusted contacts and inheritance plans.
            </p>
          </div>

          {/* Digital Journal */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <PenTool className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Journal</h3>
            <p className="text-gray-600">
              Capture daily thoughts with our beautiful journal feature. Includes mood tracking, voice notes, and private entries.
            </p>
          </div>

          {/* Collaborative Sharing */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaborative Sharing</h3>
            <p className="text-gray-600">
              Share and collaborate on memories with family and friends. Create shared collections and group time capsules.
            </p>
          </div>

          {/* Memory Analytics */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Memory Analytics</h3>
            <p className="text-gray-600">
              Gain insights into your memories with detailed analytics, mood trends, and activity patterns.
            </p>
          </div>
        </div>

        {/* Physical Time Capsule Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <HardDrive className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Secure USB Time Capsule</h2>
              </div>
              <p className="text-indigo-100 mb-6">
                Take your memories offline with our specially designed secure USB drive. Perfect for creating physical time capsules or ensuring an extra layer of backup security.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-50">Military-grade hardware encryption</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-50">Password protection with Look Back integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-50">32GB/64GB/128GB storage options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Gift className="h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-50">Elegant gift box packaging</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Sparkles className="h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-50">Custom engraving available</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://buy.stripe.com/aEUeWqfGf9eQanm6oo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#FFDD00] text-[#000000] px-6 py-3 rounded-xl hover:bg-[#FFDD00]/90 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  Purchase USB Drive - Starting at $29.99
                </a>
                <Link
                  to="/contact"
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors duration-200 flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://czyefcnulpbcusjiapat.supabase.co/storage/v1/object/public/assets/SecureUSB3.png"
                alt="Secure USB Time Capsule"
                className="rounded-xl shadow-lg w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Preserving Your Memories?</h2>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}