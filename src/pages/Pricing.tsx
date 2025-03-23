import React from 'react';
import { Coffee, Heart, Server, Gift, Sparkles, Star, HardDrive, Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="Pricing - Look Back"
        description="Look Back is completely free to use. Support ongoing development and hosting costs by buying us a coffee."
        type="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free for Everyone
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Look Back is and will always be completely free to use. If you find value in our service, consider supporting us with a coffee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 transform rotate-12 opacity-10"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Free Forever</h2>
              <Gift className="h-8 w-8 text-indigo-600" />
            </div>

            <div className="mb-8">
              <div className="text-4xl font-bold text-indigo-600 mb-2">$0</div>
              <div className="text-gray-600">No hidden fees or charges</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Star className="h-5 w-5 text-indigo-600 mr-3" />
                Unlimited memories and time capsules
              </li>
              <li className="flex items-center text-gray-600">
                <Star className="h-5 w-5 text-indigo-600 mr-3" />
                Full access to all features
              </li>
              <li className="flex items-center text-gray-600">
                <Star className="h-5 w-5 text-indigo-600 mr-3" />
                Secure cloud storage
              </li>
              <li className="flex items-center text-gray-600">
                <Star className="h-5 w-5 text-indigo-600 mr-3" />
                Legacy access management
              </li>
            </ul>

            <div className="text-sm text-gray-500 italic">
              No credit card required
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white transform rotate-12 opacity-10"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Support Our Work</h2>
              <Coffee className="h-8 w-8" />
            </div>

            <p className="text-indigo-100 mb-8">
              Your support helps us maintain and improve Look Back. All donations go towards:
            </p>

            <ul className="space-y-6 mb-8">
              <li className="flex items-start">
                <Server className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Hosting Costs</h3>
                  <p className="text-indigo-100">Keeping your memories safe and accessible</p>
                </div>
              </li>
              <li className="flex items-start">
                <Sparkles className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">New Features</h3>
                  <p className="text-indigo-100">Developing new ways to preserve memories</p>
                </div>
              </li>
              <li className="flex items-start">
                <Heart className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Community Support</h3>
                  <p className="text-indigo-100">Helping users make the most of Look Back</p>
                </div>
              </li>
            </ul>

            <a
              href="https://buymeacoffee.com/thegeekscave"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#FFDD00] text-[#000000] rounded-xl py-4 text-center font-medium hover:bg-[#FFDD00]/90 transition-colors duration-200"
            >
              ☕ Buy us a coffee
            </a>
          </div>
        </div>

        {/* Secure USB Drive Section */}
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
                  <Gift className="h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-50">Elegant gift box packaging</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://buy.stripe.com/aEUeWqfGf9eQanm6oo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#FFDD00] text-[#000000] px-6 py-3 rounded-xl hover:bg-[#FFDD00]/90 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  Purchase USB Drive - $29.99
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
                src="https://czyefcnulpbcusjiapat.supabase.co/storage/v1/object/public/assets//SecureUSB3.png"
                alt="Secure USB Time Capsule"
                className="rounded-xl shadow-lg w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Will Look Back always be free?
              </h3>
              <p className="text-gray-600">
                Yes! Our core features will always be free for everyone. We believe in making memory preservation accessible to all.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Are there any hidden charges?
              </h3>
              <p className="text-gray-600">
                Absolutely not. Look Back is completely free, with no hidden fees or charges. Your support through Buy Me a Coffee is entirely optional.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How do you maintain the service?
              </h3>
              <div className="text-gray-600 space-y-2">
                Through the generous support of our users via Buy Me a Coffee donations and our commitment to efficient resource management.
                <div className="mt-2">
                  We use Amazon S3 Glacier Deep Archive for long-term storage:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Cost: ~$0.00099 per GB per month</li>
                    <li>Total Cost (50 years, 1GB): ~$0.59 (excluding retrieval fees)</li>
                    <li>Pros: Extremely low-cost; reliable; AWS is unlikely to shut down</li>
                    <li>Cons: Retrieval is slow (up to 12 hours); occasional cost adjustments</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my memories if I don't donate?
              </h3>
              <div className="text-gray-600 space-y-2">
                Nothing! Your memories are safe and accessible regardless of whether you choose to support us financially. Donations are purely optional.
                <div className="mt-2">
                  For additional peace of mind, you can purchase our secure USB drive to keep a physical backup of your memories. The drive works seamlessly with our system and includes:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Military-grade hardware encryption</li>
                    <li>Password sync with your Look Back account</li>
                    <li>Automatic backup of your memories</li>
                    <li>Perfect for creating physical time capsules</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}