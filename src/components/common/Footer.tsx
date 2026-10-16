import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Shield, Wifi, Server, Mail, Phone, MapPin, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-900">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight leading-none">
                  NEXALUS INNOVATIONS LLP
                </span>
                <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase mt-1">
                  Internet, Network &amp; CCTV Services
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your trusted enterprise technology infrastructure partner across Maharashtra. Providing turnkey solutions in AI CCTV surveillance grids, symmetrical optical fiber leased lines, managed Layer-2/3 switching, and certified AMC maintenance.
            </p>
            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Nexalus Innovations LLP, Corporate Operations, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+91 9158886444 / +91 9822334455</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@nexalusinnovations.com</span>
              </div>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h5 className="font-bold text-sky-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Core Services
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">4K AI CCTV Surveillance</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Gigabit Optical Fiber Internet</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Layer-2/3 Managed PoE+ Switching</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Server Rack Cabling &amp; Setup</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Cat6A Fluke Structured Cabling</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Annual Maintenance Contracts (AMC)</Link>
              </li>
            </ul>
          </div>

          {/* Hardware Catalog */}
          <div>
            <h5 className="font-bold text-blue-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" /> Hardware Products
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">4K IP Bullet &amp; Dome Cameras</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Gigabit Fiber ONT &amp; Routers</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Managed PoE+ Gigabit Switches</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Next-Gen UTM Firewalls</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Multi-Bay High-Capacity NVRs</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors font-semibold text-sky-400">View All Products →</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-indigo-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" /> Corporate Desk
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Nexalus LLP</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Engineering Services</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Commercial Hardware</Link>
              </li>
              <li>
                <Link to="/quote" className="hover:text-white transition-colors text-blue-400 font-semibold">Request Quotation</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Central Office</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors flex items-center gap-1 text-slate-400">
                  <Lock className="w-3 h-3" /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Corporate Legal & Links */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} <strong className="text-slate-300">Nexalus Innovations LLP</strong>. All rights reserved. Professional Internet, Network &amp; CCTV Services in Maharashtra.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-white font-medium">Home</Link>
            <span className="text-slate-700">•</span>
            <Link to="/about" className="text-slate-400 hover:text-white font-medium">About Us</Link>
            <span className="text-slate-700">•</span>
            <Link to="/services" className="text-slate-400 hover:text-white font-medium">Services</Link>
            <span className="text-slate-700">•</span>
            <Link to="/products" className="text-slate-400 hover:text-white font-medium">Products</Link>
            <span className="text-slate-700">•</span>
            <Link to="/quote" className="text-blue-400 hover:text-blue-300 font-semibold">Get a Quote</Link>
            <span className="text-slate-700">•</span>
            <Link to="/contact" className="text-slate-400 hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
