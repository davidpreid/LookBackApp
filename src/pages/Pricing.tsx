import React from 'react';
import { Coffee, Heart, Server, Gift, Sparkles, Star, HardDrive, Shield, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free for Everyone
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Look Back is and will always be completely free to use. If you find value in our service, consider supporting us with a coffee.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 transform rotate-12 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Free Forever</h2>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Gift className="h-8 w-8 text-indigo-600" />
              </motion.div>
            </div>

            <div className="mb-8">
              <div className="text-4xl font-bold text-indigo-600 mb-2">$0</div>
              <div className="text-gray-600">No hidden fees or charges</div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Unlimited memories and time capsules",
                "Full access to all features",
                "Secure cloud storage",
                "Legacy access management",
                "Collaborative sharing",
                "Memory analytics",
                "Digital journaling",
                "Voice notes"
              ].map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex items-center text-gray-600 group/item"
                >
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-3 group-hover/item:scale-110 transition-transform duration-200" />
                  {feature}
                </motion.li>
              ))}
            </ul>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className="block w-full">
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-4 font-medium flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>

            <div className="text-sm text-gray-500 italic mt-4 text-center">
              No credit card required
            </div>
          </motion.div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white transform rotate-12 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Support Our Work</h2>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Coffee className="h-8 w-8" />
              </motion.div>
            </div>

            <p className="text-indigo-100 mb-8">
              Your support helps us maintain and improve Look Back. All donations go towards:
            </p>

            <ul className="space-y-6 mb-8">
              {[
                {
                  icon: Server,
                  title: "Hosting Costs",
                  description: "Keeping your memories safe and accessible"
                },
                {
                  icon: Sparkles,
                  title: "New Features",
                  description: "Developing new ways to preserve memories"
                },
                {
                  icon: Heart,
                  title: "Community Support",
                  description: "Helping users make the most of Look Back"
                }
              ].map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  className="flex items-start group/item"
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0 mt-1 group-hover/item:scale-110 transition-transform duration-200" />
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-indigo-100">{item.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://buymeacoffee.com/thegeekscave"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#FFDD00] text-[#000000] rounded-xl py-4 text-center font-medium hover:bg-[#FFDD00]/90 transition-colors duration-200"
            >
              ☕ Buy us a coffee
            </motion.a>
          </motion.div>
        </div>

        {/* Secure USB Drive Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white mb-16"
        >
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
                {[
                  { icon: Shield, text: "Military-grade hardware encryption" },
                  { icon: Lock, text: "Password protection with Look Back integration" },
                  { icon: Gift, text: "Elegant gift box packaging" }
                ].map((item, index) => (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="flex items-center space-x-3 group/item"
                  >
                    <item.icon className="h-5 w-5 text-indigo-200 group-hover/item:scale-110 transition-transform duration-200" />
                    <span className="text-indigo-50">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://buy.stripe.com/aEUeWqfGf9eQanm6oo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#FFDD00] text-[#000000] px-6 py-3 rounded-xl hover:bg-[#FFDD00]/90 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  Purchase USB Drive - $29.99
                </motion.a>
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
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                question: "Will Look Back always be free?",
                answer: "Yes! Our core features will always be free for everyone. We believe in making memory preservation accessible to all."
              },
              {
                question: "Are there any hidden charges?",
                answer: "Absolutely not. Look Back is completely free, with no hidden fees or charges. Your support through Buy Me a Coffee is entirely optional."
              },
              {
                question: "How do you maintain the service?",
                answer: "Through the generous support of our users via Buy Me a Coffee donations and our commitment to efficient resource management. We use Amazon S3 Glacier Deep Archive for long-term storage, which is extremely cost-effective."
              },
              {
                question: "What happens to my memories if I don't donate?",
                answer: "Nothing! Your memories are safe and accessible regardless of whether you choose to support us financially. Donations are purely optional and help us maintain and improve the service."
              }
            ].map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}