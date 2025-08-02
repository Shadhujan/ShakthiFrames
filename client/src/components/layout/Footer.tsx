import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/SPF-Logo.png';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-xl font-bold text-primary">
            <img
              src={logo}
              alt="Shakthi Logo"
              className="h-10 w-auto object-contain"
            />
            <span>Shakthi Picture Framing</span>
          </div>
            <p className="text-gray-300 leading-relaxed">
              Premium picture framing services with over 20 years of experience.
              We specialize in custom frames, art preservation, and professional
              mounting solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">
                  33A 5th Ln, Colombo 00300,<br />
                  Sri Lanka.
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">+94 7593 62837</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">shakthiframing@gmail.com</span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-400">
                <strong>Business Hours:</strong><br />
                Mon - Sat: 9:00 AM - 7:00 PM<br />
                Sunday: 10:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Shakthi Picture Framing. All rights reserved.
            Crafted with care for your precious memories.
          </p>
        </div>
      </div>
    </footer>
  );
}