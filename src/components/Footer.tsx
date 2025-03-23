import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Telescope, BookOpen, Heart, Mail, Shield } from 'lucide-react';

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className="text-gray-600 hover:text-indigo-600 transition-colors"
    >
      {children}
    </a>
  );
};

export default function Footer() {
  return (
    <footer className="bg-white/40 backdrop-blur-lg border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Product Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <FooterLink to="/features">Features</FooterLink>
              </li>
              <li>
                <FooterLink to="/pricing">Pricing</FooterLink>
              </li>
              <li>
                <FooterLink to="/case-studies">Case Studies</FooterLink>
              </li>
              <li>
                <FooterLink to="/reviews">Reviews</FooterLink>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-indigo-600" />
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <FooterLink to="/about">About Us</FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">Contact Us</FooterLink>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <FooterLink to="/cookie-policy">Cookie Policy</FooterLink>
              </li>
              <li>
                <FooterLink to="/licenses">Licenses</FooterLink>
              </li>
              <li>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink to="/terms">Terms of Service</FooterLink>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-indigo-600" />
              Connect
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Stay updated with our latest features and releases.
              </p>
              <a
                href="mailto:contact@lookbackcapsule.com"
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                contact@lookbackcapsule.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Telescope className="h-6 w-6 text-indigo-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mr-4">
                Look Back
              </span>
              <a
                href="https://buymeacoffee.com/thegeekscave"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[#FFDD00] text-[#000000] rounded-lg hover:bg-[#FFDD00]/90 transition-colors duration-200 font-medium text-sm"
              >
                ☕ Buy me a coffee
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">
              © {new Date().getFullYear()} Look Back. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}