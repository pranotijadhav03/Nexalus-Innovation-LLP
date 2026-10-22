import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Shield, Wifi, Server, Mail, Phone, MapPin, Lock, User } from 'lucide-react';
import { getSeoSettings } from '../../firebase/services';
import { initialSeoSettings } from '../../data/initialData';
import { SeoSettings } from '../../types';

export const Footer: React.FC = () => {
  const [seo, setSeo] = useState<SeoSettings>(initialSeoSettings);

  useEffect(() => {
    let isMounted = true;

    async function loadSeo() {
      try {
        const settings = await getSeoSettings();
        if (isMounted && settings) {
          setSeo(settings);
        }
      } catch (e) {
        console.warn('Failed to load SEO settings in Footer:', e);
      }
    }

    loadSeo();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail?.key || customEvent.detail?.key === 'seo') {
        loadSeo();
      }
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('nexalus_data_update', handleUpdate);
    };
  }, []);

  const socials = seo.socials || initialSeoSettings.socials;

  const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-900">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Identity & Official Socials */}
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
              Your trusted enterprise technology infrastructure partner across Maharashtra. Providing turnkey solutions in 4K CCTV surveillance grids, symmetrical optical fiber leased lines, managed Layer-2/3 switching, and certified AMC maintenance.
            </p>
            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{seo.address || 'Nexalus Innovations LLP, Corporate Operations, Maharashtra, India'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{seo.contactPhone || '+91 9158886444 / +91 9822334455'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{seo.contactEmail || 'contact@nexalusinnovations.com'}</span>
              </div>
            </div>

            {/* Official Social Media Presence */}
            <div className="pt-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-2">
                Official Social Media Presence
              </span>
              <div className="flex items-center gap-2.5">
                {socials.linkedin && (
                  <a
                    href={formatExternalUrl(socials.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 hover:border-blue-500 hover:scale-105 shadow-2xs"
                    title="LinkedIn — Nexalus Innovations LLP"
                    aria-label="Official LinkedIn Page"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </a>
                )}

                {socials.twitter && (
                  <a
                    href={formatExternalUrl(socials.twitter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 hover:border-slate-500 hover:scale-105 shadow-2xs"
                    title="X / Twitter — Nexalus Innovations"
                    aria-label="Official X Profile"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}

                {socials.facebook && (
                  <a
                    href={formatExternalUrl(socials.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 hover:border-blue-600 hover:scale-105 shadow-2xs"
                    title="Facebook — Nexalus Innovations"
                    aria-label="Official Facebook Page"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
                    </svg>
                  </a>
                )}

                {socials.instagram && (
                  <a
                    href={formatExternalUrl(socials.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800 hover:border-pink-500 hover:scale-105 shadow-2xs"
                    title="Instagram — Nexalus Innovations"
                    aria-label="Official Instagram Page"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
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
                <Link to="/services" className="hover:text-white transition-colors">4K Commercial CCTV Surveillance</Link>
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
                <Link to="/plans" className="hover:text-white transition-colors">Broadband Plans &amp; Pricing</Link>
              </li>
              <li>
                <Link to="/quote" className="hover:text-white transition-colors text-blue-400 font-semibold">Request Quotation</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Central Office</Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors flex items-center gap-1 text-sky-400 font-semibold">
                  <User className="w-3 h-3" /> Customer Portal / Account
                </Link>
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
            <Link to="/plans" className="text-slate-400 hover:text-white font-medium">Plans &amp; Pricing</Link>
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
