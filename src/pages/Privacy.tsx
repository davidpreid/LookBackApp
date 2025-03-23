import React from 'react';
import { Shield, Lock, Eye, Key, Database, UserCheck } from 'lucide-react';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Privacy Policy - Look Back"
        description="Learn about how Look Back protects your privacy and handles your personal data. Our commitment to keeping your memories safe and secure."
        type="article"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is our top priority. Learn how we protect your personal information and memories.
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
            </div>
            <p className="text-gray-600 mb-4">
              This Privacy Policy explains how Look Back ("we", "our", or "us") collects, uses, and protects your personal information when you use our digital memory preservation service.
            </p>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Email address and account credentials</li>
                <li>Profile information (name, avatar, bio)</li>
                <li>Content you create and upload</li>
                <li>Usage data and preferences</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Device information</li>
                <li>IP address and location data</li>
                <li>Browser type and settings</li>
                <li>Usage patterns and interactions</li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>To provide and maintain our service</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>To process and store your memories securely</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>To communicate with you about your account and updates</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>To improve and personalize your experience</span>
              </li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600 mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>End-to-end encryption for all stored memories</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Regular security audits and updates</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Secure data centers with redundant backups</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Strict access controls and authentication</span>
              </li>
            </ul>
          </div>

          {/* Your Rights */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <UserCheck className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <p className="text-gray-600 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Right to access and view your personal data</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Right to correct or update your information</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Right to delete your account and data</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Right to export your data</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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