import React from 'react';
import { BookOpen, Code, Package, FileText } from 'lucide-react';
import SEO from '../components/SEO';

export default function Licenses() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Licenses - Look Back"
        description="View the licenses and attributions for software used in Look Back's digital memory preservation service."
        type="article"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Licenses</h1>
          <p className="text-xl text-gray-600">
            Acknowledgments and licenses for the software that powers Look Back
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Application License */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Look Back Application</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Copyright © {new Date().getFullYear()} Look Back. All rights reserved.
            </p>
            <p className="text-gray-600">
              This software is proprietary and confidential. Unauthorized copying, modification,
              distribution, or use of this software, via any medium, is strictly prohibited.
            </p>
          </div>

          {/* Open Source Dependencies */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Open Source Dependencies</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">React</h3>
                <p className="text-gray-600 mb-2">
                  MIT License
                </p>
                <p className="text-sm text-gray-500">
                  Copyright (c) Meta Platforms, Inc. and affiliates.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vite</h3>
                <p className="text-gray-600 mb-2">
                  MIT License
                </p>
                <p className="text-sm text-gray-500">
                  Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tailwind CSS</h3>
                <p className="text-gray-600 mb-2">
                  MIT License
                </p>
                <p className="text-sm text-gray-500">
                  Copyright (c) Tailwind Labs, Inc.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lucide React</h3>
                <p className="text-gray-600 mb-2">
                  ISC License
                </p>
                <p className="text-sm text-gray-500">
                  Copyright (c) 2020, Lucide Contributors
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Supabase</h3>
                <p className="text-gray-600 mb-2">
                  Apache License 2.0
                </p>
                <p className="text-sm text-gray-500">
                  Copyright (c) 2020 Supabase
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chart.js</h3>
                <p className="text-gray-600 mb-2">
                  MIT License
                </p>
                <p className="text-sm text-gray-500">
                  Copyright (c) 2014-2022 Chart.js Contributors
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">date-fns</h3>
                <p className="text-gray-600 mb-2">
                  MIT License
                </p>
                <p className="text-sm text-gray-500">
                  Copyright (c) 2021 Sasha Koss and Lesha Koss
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Services */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Analytics</h3>
                <p className="text-gray-600">
                  Used for website analytics and performance monitoring. Subject to Google's Terms of Service and Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsplash</h3>
                <p className="text-gray-600">
                  Some images used in our service are provided by Unsplash under their license terms.
                </p>
              </div>
            </div>
          </div>

          {/* MIT License Text */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">MIT License Text</h2>
            <div className="prose text-gray-600">
              <p className="mb-4">
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the "Software"), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is
                furnished to do so, subject to the following conditions:
              </p>
              <p className="mb-4">
                The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.
              </p>
              <p>
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                SOFTWARE.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Licensing?</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about our licenses or attributions, please contact us:
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