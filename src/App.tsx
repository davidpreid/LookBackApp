import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Reviews from './pages/Reviews';
import CaseStudies from './pages/CaseStudies';
import Licenses from './pages/Licenses';
import Features from './pages/Features';
import CookiePolicy from './pages/CookiePolicy';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicBoard from './pages/PublicBoard';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import TimeCapsule from './pages/TimeCapsule';
import LegacyAccess from './pages/LegacyAccess';
import Timeline from './pages/Timeline';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import ProtectedRoute from './components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Gift, Lock, Calendar, Upload, Download, Clock, Menu, X, BookOpen, Shield, PenTool, Users, BarChart, HardDrive, Sparkles, Database, ArrowRight } from 'lucide-react';
import './index.css';
import './styles/grid-pattern.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function LandingHero() {
  const { user } = useAuth();
  
  return (
    <>
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
        <div className="container mx-auto px-4 py-16 relative z-10">
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
                {user ? (
                  <Link to="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl 
                               shadow-lg hover:shadow-xl font-medium text-lg flex items-center gap-2"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl 
                                 shadow-lg hover:shadow-xl font-medium text-lg flex items-center gap-2"
                      >
                        Get Started
                      </motion.button>
                    </Link>
                    
                    <Link to="/login">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white text-indigo-600 rounded-xl shadow-lg hover:shadow-xl 
                                 font-medium text-lg flex items-center gap-2 border border-indigo-100"
                      >
                        Sign In
                      </motion.button>
                    </Link>
                  </>
                )}
              </div>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-6 mt-12">
                {[
                  { icon: BookOpen, text: "Smart Organization" },
                  { icon: Clock, text: "Time Capsules" },
                  { icon: Shield, text: "Legacy Protection" },
                  { icon: PenTool, text: "Digital Journal" },
                  { icon: Users, text: "Collaborative Sharing" },
                  { icon: BarChart, text: "Memory Analytics" }
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
                        <h3 className="text-xl font-semibold text-gray-900">Summer Memories 2024</h3>
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
                          <img
                            src={`/demo/memory${i}.jpg`}
                            alt={`Memory ${i}`}
                            className="w-full h-full object-cover opacity-80"
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

          {/* Animated Scroll Arrow */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
            onClick={() => {
              document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-600 mb-2">Discover Features</span>
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Comprehensive Features Section */}
      <div id="features-section" className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Your Memories
            </h2>
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
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white">
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
                <Link to="/register" className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium"
                  >
                    Get Started Now
                  </motion.button>
                </Link>
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
        </div>
      </div>
    </>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50 pt-24">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingHero />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/public-board" element={<PublicBoard />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/licenses" element={<Licenses />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <Timeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/time-capsule"
                element={
                  <ProtectedRoute>
                    <TimeCapsule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/legacy-access"
                element={
                  <ProtectedRoute>
                    <LegacyAccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journal"
                element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster position="top-right" />
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;