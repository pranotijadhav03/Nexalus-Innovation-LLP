import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Cpu, Truck, Mail, Phone, MapPin } from 'lucide-react';

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
                  Technology &amp; Distribution Conglomerate
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Nexalus Innovations LLP governs two premier commercial operating companies: <strong>Nexalus Innovations</strong> (CCTV Surveillance, Gigabit Fiber Internet &amp; Enterprise IT Networking) and <strong>A.M. Distributors Chiplun</strong> (Regional Logistics Hub for Packaged Mineral Water, Commercial Ice Cream &amp; Complete Dairy Distribution).
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

          {/* Operating Company 1: Nexalus Innovations */}
          <div>
            <h5 className="font-bold text-sky-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Nexalus Innovations
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/brands/nexalus-innovations" className="hover:text-white transition-colors font-semibold text-white">
                  Visit Division Website →
                </Link>
              </li>
              <li>
                <Link to="/brands/nexalus-innovations" className="hover:text-white transition-colors">4K AI CCTV Surveillance</Link>
              </li>
              <li>
                <Link to="/brands/nexalus-innovations" className="hover:text-white transition-colors">Gigabit Optical Fiber Internet</Link>
              </li>
              <li>
                <Link to="/brands/nexalus-innovations" className="hover:text-white transition-colors">Layer-2/3 Managed PoE+ Switches</Link>
              </li>
              <li>
                <Link to="/brands/nexalus-innovations" className="hover:text-white transition-colors">Pure Copper Cat6A Structured Cabling</Link>
              </li>
              <li>
                <Link to="/brands/nexalus-innovations" className="hover:text-white transition-colors">Annual Maintenance Contracts (AMC)</Link>
              </li>
            </ul>
          </div>

          {/* Operating Company 2: A.M. Distributors Chiplun */}
          <div>
            <h5 className="font-bold text-teal-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> A.M. Distributors
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/brands/am-distributors" className="hover:text-white transition-colors font-semibold text-white">
                  Visit Division Website →
                </Link>
              </li>
              <li>
                <Link to="/brands/am-distributors" className="hover:text-white transition-colors">Packaged Mineral Water (20L Jars)</Link>
              </li>
              <li>
                <Link to="/brands/am-distributors" className="hover:text-white transition-colors">Commercial Ice Cream (-18°C Fleet)</Link>
              </li>
              <li>
                <Link to="/brands/am-distributors" className="hover:text-white transition-colors">Farm-Fresh Milk &amp; Dairy Supply</Link>
              </li>
              <li>
                <Link to="/brands/am-distributors" className="hover:text-white transition-colors">Butter, Ghee &amp; Milk Products</Link>
              </li>
              <li>
                <Link to="/brands/am-distributors" className="hover:text-white transition-colors">Chiplun Regional Cold-Chain Depot</Link>
              </li>
            </ul>
          </div>

          {/* Corporate Quick Links */}
          <div>
            <h5 className="font-bold text-indigo-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Corporate Desk
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Nexalus LLP</Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-white transition-colors">Operating Divisions</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Commercial Catalog</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Engineering &amp; Logistics Services</Link>
              </li>
              <li>
                <Link to="/quote" className="hover:text-white transition-colors text-blue-400 font-semibold">Request Commercial Quotation</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Central Office</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Corporate Legal & Links */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} <strong className="text-slate-400">Nexalus Innovations LLP</strong>. All rights reserved. Operating companies: <strong className="text-sky-400">Nexalus Innovations</strong> &amp; <strong className="text-teal-400">A.M. Distributors Chiplun</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/brands/nexalus-innovations" className="text-sky-400 hover:text-sky-300 font-semibold">Nexalus Innovations</Link>
            <span className="text-slate-700">•</span>
            <Link to="/brands/am-distributors" className="text-teal-400 hover:text-teal-300 font-semibold">A.M. Distributors Chiplun</Link>
            <span className="text-slate-700">•</span>
            <Link to="/quote" className="text-blue-400 hover:text-blue-300 font-semibold">Request Quotation</Link>
            <span className="text-slate-700">•</span>
            <Link to="/contact" className="text-slate-500 hover:text-slate-300">Contact Us</Link>
            <span className="text-slate-700">•</span>
            <Link to="/admin/login" className="text-slate-400 hover:text-white font-semibold flex items-center gap-1">🔒 Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
