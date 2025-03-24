import { motion } from 'framer-motion';
import { Gift, Lock, Calendar, Upload, Download, Clock } from 'lucide-react';
import Image from 'next/image';

export default function LandingHero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[Clock, Gift, Lock, Calendar].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: index * 2,
            }}
            style={{
              left: `${20 + index * 25}%`,
              top: `${30 + (index % 2) * 20}%`,
            }}
          >
            <Icon className="w-12 h-12 text-indigo-300" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Preserve Your Memories
              </span>
              <br />
              <span className="text-gray-900">
                Until the Perfect Moment
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Create digital time capsules filled with your precious memories, photos, and voice recordings. 
              Lock them away and rediscover them when the time is right.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl 
                         shadow-lg hover:shadow-xl font-medium text-lg flex items-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Create Time Capsule
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl shadow-lg hover:shadow-xl 
                         font-medium text-lg flex items-center gap-2 border border-indigo-100"
              >
                <Upload className="w-5 h-5" />
                Restore Backup
              </motion.button>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              {[
                { icon: Lock, text: "Secure Encryption" },
                { icon: Calendar, text: "Custom Lock Periods" },
                { icon: Upload, text: "Easy Backup" },
                { icon: Download, text: "Quick Restore" },
              ].map(({ icon: Icon, text }, index) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-indigo-50"
                >
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="font-medium text-gray-700">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Capsule Preview */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-br from-white to-indigo-100 rounded-3xl shadow-2xl 
                         border border-indigo-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">Summer Memories 2025</h3>
                      <p className="text-sm text-gray-500">Unlocks on June 21, 2029</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <Lock className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="aspect-square rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 
                                 overflow-hidden relative"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Image
                          src={`/demo/memory${i}.jpg`}
                          alt={`Memory ${i}`}
                          layout="fill"
                          objectFit="cover"
                          className="opacity-80"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-2">
                    {['Summer', 'Beach', 'Family', 'Vacation'].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/50 rounded-lg text-sm text-indigo-600 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Small Capsules */}
              {[
                { scale: 0.6, right: '-20%', top: '10%', delay: 0 },
                { scale: 0.4, left: '-10%', bottom: '20%', delay: 1.5 },
              ].map((style, index) => (
                <motion.div
                  key={index}
                  className="absolute bg-white rounded-2xl shadow-lg border border-indigo-50 p-4 w-48"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: style.scale,
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: style.delay,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{
                    left: style.left,
                    right: style.right,
                    top: style.top,
                    bottom: style.bottom,
                  }}
                >
                  <div className="space-y-2">
                    <div className="w-full aspect-video rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100" />
                    <div className="h-2 w-2/3 bg-indigo-100 rounded" />
                    <div className="h-2 w-1/2 bg-purple-100 rounded" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 