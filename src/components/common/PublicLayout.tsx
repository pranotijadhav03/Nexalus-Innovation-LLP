import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CustomerChoiceModal, CustomerModalView } from './CustomerChoiceModal';
import { PlanOrderModal } from './PlanOrderModal';
import { FloatingCallButton } from './FloatingCallButton';
import { FloatingWhatsAppButton } from './FloatingWhatsAppButton';
import { useAuth } from '../../context/AuthContext';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
};

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, isCustomer, isLoading } = useAuth();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [modalView, setModalView] = useState<CustomerModalView>('choice');
  const [modalPrompt, setModalPrompt] = useState<string | null>(null);
  const [modalContext, setModalContext] = useState<string | null>(null);
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Trigger popup once per session for unauthenticated visitors after short delay
  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    try {
      const dismissed = sessionStorage.getItem('nexalus_customer_choice_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsCustomerModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [isAuthenticated, isLoading]);

  // Listen for global custom event to open customer portal from any link or button
  useEffect(() => {
    const handleOpen = (e: any) => {
      const targetView = (e.detail?.view as CustomerModalView) || 'choice';
      const prompt = e.detail?.prompt || null;
      const ctx = e.detail?.context || null;
      setModalView(targetView);
      setModalPrompt(prompt);
      setModalContext(ctx);
      setIsCustomerModalOpen(true);
    };

    window.addEventListener('open_customer_portal', handleOpen);
    return () => window.removeEventListener('open_customer_portal', handleOpen);
  }, []);

  // Global listener for direct plan orders (BUY NOW)
  useEffect(() => {
    const handleDirectOrder = (e: any) => {
      if (e?.detail) {
        if (!isCustomer) {
          try {
            sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify(e.detail));
          } catch {}
          setModalView('choice');
          setModalPrompt(
            `Customer Login Required: Direct Buy Now is restricted. Please register or log in with your verified Customer account to purchase ${e.detail.providerName || ''} - ${e.detail.planName || ''} (${e.detail.speed || ''}). Once logged in as a customer, Buy Now will open immediately.`
          );
          setModalContext('buy_now');
          setIsCustomerModalOpen(true);
          return;
        }
        setSelectedPlanForOrder(e.detail);
        setIsOrderModalOpen(true);
      }
    };

    window.addEventListener('open_plan_order_direct', handleDirectOrder);
    return () => window.removeEventListener('open_plan_order_direct', handleDirectOrder);
    
  }, [isCustomer]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Direct Phone Call Floating Button (Directly Above WhatsApp) */}
      <FloatingCallButton phoneNumber="+919158886444" title="Direct Call Admin: +91 9158886444" />

      {/* Global Quick WhatsApp Connect Floating Button */}
      <FloatingWhatsAppButton phoneNumber="919158886444" message="Hello Nexalus Innovations LLP, I would like to inquire about your services and products." />

      <Footer />

      {/* Customer Choice / Login / Register Modal */}
      <CustomerChoiceModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setModalPrompt(null);
          setModalContext(null);
        }}
        initialView={modalView}
        promptMessage={modalPrompt}
        authContext={modalContext}
      />

      {/* Global Instant Direct Order Modal (BUY NOW) */}
      <PlanOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedPlanForOrder(null);
        }}
        plan={selectedPlanForOrder}
        onOrderSuccess={() => {
          setIsOrderModalOpen(false);
          setSelectedPlanForOrder(null);
        }}
      />
    </div>
  );
};
