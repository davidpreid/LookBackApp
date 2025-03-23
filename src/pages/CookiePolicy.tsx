import React from 'react';
import { Cookie, Shield, Settings, Bell, Database, Info } from 'lucide-react';
import SEO from '../components/SEO';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Cookie Policy - Look Back"
        description="Learn about how Look Back uses cookies to enhance your experience and protect your privacy."
        type="article"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Cookie className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-xl text-gray-600">
            Understanding how we use cookies to improve your experience
          </p>
        </div>

        <div className="space-y-8">
          {/* What Are Cookies */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Info className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Remembering your preferences and settings</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Understanding how you use our service</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Keeping your account secure</span>
              </li>
            </ul>
          </div>

          {/* Types of Cookies We Use */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600">
                  Required for the website to function properly. These cannot be disabled.
                </p>
                <ul className="mt-2 space-y-2 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                    <span>Authentication and security</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                    <span>Session management</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                <p className="text-gray-600">
                  Enhance your experience but are not essential.
                </p>
                <ul className="mt-2 space-y-2 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                    <span>Remember your preferences</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                    <span>Personalize your experience</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-600">
                  Help us understand how visitors use our website.
                </p>
                <ul className="mt-2 space-y-2 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                    <span>Track page views and navigation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                    <span>Measure feature usage and performance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cookie Management */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Managing Your Cookie Preferences</h2>
            </div>
            <p className="text-gray-600 mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
            </p>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Browser Settings</h3>
              <p className="text-gray-600">
                Most browsers allow you to:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                  <span>View cookies stored on your device</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                  <span>Allow or block specific types of cookies</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                  <span>Clear cookies periodically</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Updates to Policy */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Updates to This Policy</h2>
            </div>
            <p className="text-gray-600 mb-4">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Questions?</h2>
            </div>
            <p className="text-gray-600 mb-4">
              If you have any questions about our Cookie Policy, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-600">
                Email: <a href="mailto:privacy@lookbackcapsule.com" className="text-indigo-600 hover:text-indigo-700">privacy@lookbackcapsule.com</a>
              </p>
              <p className="text-gray-600">
                Address: 2 Dublin Landings, North Wall Quay, Dublin 1, D01 V4A3, Ireland
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}