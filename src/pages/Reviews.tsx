import React from 'react';
import { Star, Quote, Heart, Clock, Shield, Users, ThumbsUp } from 'lucide-react';
import SEO from '../components/SEO';

interface Review {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  date: string;
  avatar: string;
  feature: string;
  featureIcon: React.ReactNode;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Family Historian",
    content: "Look Back has transformed how I preserve our family memories. The time capsule feature is incredibly meaningful - I've set up capsules for my children to open on their 18th birthdays. The interface is beautiful and intuitive.",
    rating: 5,
    date: "February 2025",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
    feature: "Time Capsules",
    featureIcon: <Clock className="h-5 w-5 text-purple-600" />
  },
  {
    id: 2,
    name: "David Chen",
    role: "Digital Archivist",
    content: "As someone who works with digital archives professionally, I'm impressed by Look Back's approach to long-term preservation. The legacy access feature ensures our digital memories won't be lost to time. And it's completely free - remarkable!",
    rating: 5,
    date: "January 2025",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    feature: "Legacy Protection",
    featureIcon: <Shield className="h-5 w-5 text-indigo-600" />
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Travel Blogger",
    content: "The collaborative features are fantastic! I can easily share travel memories with my family while keeping certain moments private. The analytics help me track my adventures across different countries. It's like having a smart travel diary.",
    rating: 5,
    date: "March 2025",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
    feature: "Sharing & Analytics",
    featureIcon: <Users className="h-5 w-5 text-pink-600" />
  }
];

const highlights = [
  {
    title: "100% Free Forever",
    description: "No hidden fees, no premium features, just pure memory preservation for everyone.",
    icon: <Heart className="h-6 w-6 text-red-500" />
  },
  {
    title: "Military-Grade Security",
    description: "Your memories are protected with end-to-end encryption and secure cloud storage.",
    icon: <Shield className="h-6 w-6 text-indigo-500" />
  },
  {
    title: "Community Favorite",
    description: "Join thousands of users preserving their precious memories with Look Back.",
    icon: <ThumbsUp className="h-6 w-6 text-green-500" />
  }
];

export default function Reviews() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO 
        title="User Reviews - Look Back"
        description="See what our users say about Look Back. Read reviews and testimonials about our digital memory preservation service."
        type="article"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of people preserving their precious memories with Look Back.
            Here's what our community has to say about their experience.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {highlights.map((highlight, index) => (
            <div key={index} className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                {highlight.icon}
                <h3 className="text-lg font-semibold text-gray-900">{highlight.title}</h3>
              </div>
              <p className="text-gray-600">{highlight.description}</p>
            </div>
          ))}
        </div>

        {/* Featured Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/40 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg relative">
              <div className="absolute top-6 right-6">
                <Quote className="h-8 w-8 text-indigo-100" />
              </div>
              
              <div className="flex items-start space-x-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-2">
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>

              <div className="mt-4 text-gray-600">{review.content}</div>

              <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
                {review.featureIcon}
                <span>Loves our {review.feature}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Memory Journey?</h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join our growing community and start preserving your precious memories today.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/register"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Get Started - It's Free
            </a>
            <a
              href="https://buymeacoffee.com/thegeekscave"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#FFDD00] text-[#000000] rounded-xl hover:bg-[#FFDD00]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              ☕ Support Our Mission
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}