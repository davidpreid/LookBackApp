import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Shield, Users, Heart, Star } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="About Look Back - Digital Memory Preservation"
        description="Learn about Look Back's mission to help you preserve and cherish your memories through digital time capsules and memory preservation."
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Look Back</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Your personal journey deserves to be preserved, shared, and remembered. Look Back helps you create meaningful digital time capsules of your life's most precious moments.
          </p>
          <p className="text-lg text-indigo-600 font-medium">
            Completely free forever. No hidden fees, no premium features, no limits.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-20">
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Our Mission</h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-6">
              To help everyone preserve their memories in a meaningful way, ensuring that life's most precious moments are never forgotten and can be shared with future generations.
            </p>
            <div className="flex justify-center">
              <a
                href="https://buymeacoffee.com/thegeekscave"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-[#FFDD00] text-[#000000] rounded-lg hover:bg-[#FFDD00]/90 transition-colors duration-200 font-medium"
              >
                ☕ Support our mission - Buy us a coffee
              </a>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Memory Organization</h3>
            </div>
            <p className="text-gray-600">
              Intelligently categorize and tag your memories with our enhanced organization system. Keep your life's story well-structured and easily accessible.
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Time Capsules</h3>
            </div>
            <p className="text-gray-600">
              Create digital time capsules to preserve memories for future discovery. Set unlock dates and share the excitement of rediscovery.
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Legacy Protection</h3>
            </div>
            <p className="text-gray-600">
              Ensure your memories live on with our legacy access feature. Choose trusted individuals to inherit your digital memories.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose Look Back?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
                  <p className="text-gray-600 mb-2">
                    Your memories are yours alone. We use end-to-end encryption and strict privacy controls to keep your data secure.
                  </p>
                  <p className="text-sm text-indigo-600">
                    Free forever, because privacy shouldn't be a premium feature.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Sharing</h3>
                    <p className="text-gray-600">
                      Share memories with family members and create collaborative collections of shared experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Preserving Your Memories?</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Contact Us
            </Link>
            <a
              href="https://buymeacoffee.com/thegeekscave"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#FFDD00] text-[#000000] rounded-xl hover:bg-[#FFDD00]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ☕ Buy us a coffee</a>
          </div>
        </div>
      </div>
    </div>
  );
}