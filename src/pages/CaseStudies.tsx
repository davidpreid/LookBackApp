import React from 'react';
import { Baby, GraduationCap, TimerOff, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const CaseStudies = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Case Studies - Look Back"
        description="Discover how people use Look Back to preserve and share their most precious memories. Read real stories of digital memory preservation."
        type="article"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real Stories, Real Impact
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Look Back helps people preserve their most precious memories and create lasting legacies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Case Study 1 */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Baby className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">From First Steps to First Words</h2>
                <p className="text-gray-600">A Baby's Life Journey</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-900 mb-2">📌 Use Case</h3>
                <p className="text-pink-800">Parents documenting their child's growth from birth to adulthood.</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">✅ Features Used</h3>
                <ul className="text-indigo-800 space-y-1">
                  <li>• Memory Journal</li>
                  <li>• Photo/Video Uploads</li>
                  <li>• Time Capsule Unlocks</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📖 Story</h3>
                <p className="text-gray-600">
                  New parents start a Look Back Capsule when their baby is born, recording milestones like first words, first steps, and school achievements. They add voice messages and future birthday letters. When the child turns 18, they receive their entire life's journey in a digital time capsule.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">💡 Impact</h3>
                <p className="text-green-800">A priceless gift of memories, giving the child a personal history they can cherish forever.</p>
              </div>
            </div>
          </div>

          {/* Case Study 2 */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">A Grandfather's Legacy</h2>
                <p className="text-gray-600">Passing Down Wisdom</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">📌 Use Case</h3>
                <p className="text-amber-800">Older individuals sharing life lessons, family history, and personal reflections.</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">✅ Features Used</h3>
                <ul className="text-indigo-800 space-y-1">
                  <li>• Video/Voice Recording</li>
                  <li>• Scheduled Messages</li>
                  <li>• Legacy Notes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📖 Story</h3>
                <p className="text-gray-600">
                  A grandfather records life lessons, family stories, and personal messages for his grandchildren. He schedules messages for key moments in their lives—like their first job or wedding day—ensuring they receive his wisdom even when he's no longer around.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">💡 Impact</h3>
                <p className="text-green-800">Keeps family history alive and strengthens generational bonds.</p>
              </div>
            </div>
          </div>

          {/* Case Study 3 */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TimerOff className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Messages for the Future</h2>
                <p className="text-gray-600">A Personal Time Capsule</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">📌 Use Case</h3>
                <p className="text-purple-800">Individuals sending messages to their future selves.</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">✅ Features Used</h3>
                <ul className="text-indigo-800 space-y-1">
                  <li>• Diary/Memory Journal</li>
                  <li>• Mood Tracking</li>
                  <li>• AI Reflections</li>
                  <li>• Future Unlocks</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📖 Story</h3>
                <p className="text-gray-600">
                  A young professional writes letters to their future self about their dreams and goals. They schedule these messages to unlock every five years, allowing them to reflect on how much they've grown and changed.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">💡 Impact</h3>
                <p className="text-green-800">Helps with self-reflection, personal growth, and motivation over time.</p>
              </div>
            </div>
          </div>

          {/* Case Study 4 */}
          <div className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Final Words, Everlasting Love</h2>
                <p className="text-gray-600">A Digital Legacy for Loved Ones</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">📌 Use Case</h3>
                <p className="text-red-800">Preparing heartfelt messages for family in case of unexpected events.</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">✅ Features Used</h3>
                <ul className="text-indigo-800 space-y-1">
                  <li>• Legacy Journal</li>
                  <li>• Private Video Messages</li>
                  <li>• Designated Recipient Access</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📖 Story</h3>
                <p className="text-gray-600">
                  A mother battling illness records personalized messages for her children, set to unlock on their birthdays, graduations, and other milestones. Even after she's gone, her words and love remain a part of their lives.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">💡 Impact</h3>
                <p className="text-green-800">Provides emotional comfort and keeps memories alive for future generations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Own Memory Journey</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of others who are preserving their precious memories with Look Back. Create your own legacy today.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudies;