import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, Home, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-md">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-5xl font-black text-slate-900 tracking-tight block">404</span>
          <h1 className="text-xl font-bold text-slate-800">Page Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page you are looking for does not exist on Nexalus Innovations LLP or has been moved to a new route.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="md">
              Contact Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
