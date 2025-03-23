import React from 'react';
import { Scale, Shield, FileText, AlertTriangle, BookOpen, Users } from 'lucide-react';
import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Terms of Service - Look Back"
        description="Read our terms of service to understand your rights and responsibilities when using Look Back's digital memory preservation service."
        type="article"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using Look Back.
          </p>
        </div>

        <div className="space-y-8">
          {/* Agreement */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Agreement to Terms</h2>
            </div>
            <p className="text-gray-600 mb-4">
              By accessing or using Look Back, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of the terms, you may not access the service.
            </p>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Account Terms */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Account Terms</h2>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>You must be at least 13 years old to use this service</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>You must provide accurate and complete registration information</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>You are responsible for maintaining the security of your account</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>You must notify us immediately of any unauthorized access</span>
              </li>
            </ul>
          </div>

          {/* Content Guidelines */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Content Guidelines</h2>
            </div>
            <p className="text-gray-600 mb-4">
              You retain ownership of your content. By using our service, you grant us a license to:
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Store and backup your content</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Display your content according to your privacy settings</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Modify and adapt content for technical requirements</span>
              </li>
            </ul>
          </div>

          {/* Prohibited Activities */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
            </div>
            <p className="text-gray-600 mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Uploading illegal or harmful content</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Violating intellectual property rights</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Attempting to gain unauthorized access</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Interfering with service operation</span>
              </li>
            </ul>
          </div>

          {/* Service Modifications */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Service Modifications</h2>
            </div>
            <p className="text-gray-600 mb-4">
              We reserve the right to:
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Modify or discontinue any part of our service</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Update these terms with reasonable notice</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span>Limit or restrict access to certain features</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-600">
                Email: <a href="mailto:legal@lookbackcapsule.com" className="text-indigo-600 hover:text-indigo-700">legal@lookbackcapsule.com</a>
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