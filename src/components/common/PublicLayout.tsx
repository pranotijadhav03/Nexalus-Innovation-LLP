import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CustomerChoiceModal, CustomerModalView } from './CustomerChoiceModal';
import { PlanOrderModal } from './PlanOrderModal';
import { FloatingCallButton } from './FloatingCallButton';
import { FloatingWhatsAppButton } from './FloatingWhatsAppButton';
import { useAuth } from '../../context/AuthContext';
import { isCustomerLinkedToCompany } from '../../firebase/services';

export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const scrollToEl = () => {
        const el = document.getElementById(targetId) ||
          document.getElementById(`sec-${targetId}`) ||
          document.getElementById(`sec-inno-${targetId}`) ||
          document.getElementById(`sec-am-${targetId}`) ||
          document.getElementById(`section-${targetId}`);
        if (el) {
          const yOffset = -80;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollToEl()) {
        const t1 = setTimeout(scrollToEl, 80);
        const t2 = setTimeout(scrollToEl, 250);
        const t3 = setTimeout(scrollToEl, 500);
        const t4 = setTimeout(scrollToEl, 1000);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
        };
      }
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname, search, hash]);

  return null;
};

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { currentUser, isAuthenticated, isCustomer, isLoading } = useAuth();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [modalView, setModalView] = useState<CustomerModalView>('choice');
  const [modalPrompt, setModalPrompt] = useState<string | null>(null);
  const [modalContext, setModalContext] = useState<string | null>(null);
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Trigger popup once per session for unlinked visitors (guests or users signed in under other companies)
  useEffect(() => {
    if (isLoading) return;

    // Check if customer is already linked to parent company
    const isLinkedToParent = isCustomerLinkedToCompany(currentUser, 'nexalus-llp');

    // If already linked, or an admin is signed in, do not auto-pop
    if (isLinkedToParent) return;
    if (currentUser && currentUser.role !== 'customer') return;

    try {
      const dismissKey = currentUser
        ? ('nexalus_choice_dismissed_nexalus-llp_' + currentUser.uid)
        : 'nexalus_choice_dismissed_nexalus-llp_guest';
      const dismissed = sessionStorage.getItem(dismissKey);
      if (!dismissed) {
        const timer = setTimeout(() => {
          setModalView('choice');
          setIsCustomerModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [currentUser, isLoading]);

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
            `Please register or log in to buy ${e.detail.providerName || ''} - ${e.detail.planName || ''} (${e.detail.speed || ''}).`
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
        targetCompanyScope="nexalus-llp"
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
