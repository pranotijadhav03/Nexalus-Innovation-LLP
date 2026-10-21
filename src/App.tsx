import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/common/CartDrawer';
import { PublicLayout } from './components/common/PublicLayout';

// Public Corporate Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { BrandsPage } from './pages/public/BrandsPage';
import { SolutionsPage } from './pages/public/SolutionsPage';
import { ProductsPage } from './pages/public/ProductsPage';
import { QuotePage } from './pages/public/QuotePage';
import { ContactPage } from './pages/public/ContactPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { NexalusInnovationsPage } from './pages/public/divisions/NexalusInnovationsPage';
import { AmDistributorsPage } from './pages/public/divisions/AmDistributorsPage';

// CP PLUS Division Pages
import { CpPlusHomePage } from './pages/public/cp-plus/CpPlusHomePage';
import { CpPlusAboutPage } from './pages/public/cp-plus/CpPlusAboutPage';
import { CpPlusProductsPage } from './pages/public/cp-plus/CpPlusProductsPage';
import { CpPlusProductDetailPage } from './pages/public/cp-plus/CpPlusProductDetailPage';
import { CpPlusServicesPage } from './pages/public/cp-plus/CpPlusServicesPage';
import { CpPlusProjectsPage } from './pages/public/cp-plus/CpPlusProjectsPage';
import { CpPlusContactPage } from './pages/public/cp-plus/CpPlusContactPage';

// One Broadband Division Pages
import { OneBroadbandHomePage } from './pages/public/one-broadband/OneBroadbandHomePage';
import { OneBroadbandAboutPage } from './pages/public/one-broadband/OneBroadbandAboutPage';
import { OneBroadbandPlansPage } from './pages/public/one-broadband/OneBroadbandPlansPage';
import { OneBroadbandProductsPage } from './pages/public/one-broadband/OneBroadbandProductsPage';
import { OneBroadbandServicesPage } from './pages/public/one-broadband/OneBroadbandServicesPage';
import { OneBroadbandCoveragePage } from './pages/public/one-broadband/OneBroadbandCoveragePage';
import { OneBroadbandContactPage } from './pages/public/one-broadband/OneBroadbandContactPage';

// ITTI Networking Division Pages
import { IttiNetworkingHomePage } from './pages/public/itti-networking/IttiNetworkingHomePage';

// Admin Portal Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminServiceAreasPage } from './pages/admin/AdminServiceAreasPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminFaqsPage } from './pages/admin/AdminFaqsPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminTeamPage } from './pages/admin/AdminTeamPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSeoPage } from './pages/admin/AdminSeoPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Sub-Website Layouts
import { NexalusInnovationsLayout } from './components/brand/NexalusInnovationsLayout';
import { AmDistributorsLayout } from './components/brand/AmDistributorsLayout';

// Nexalus Innovations Sub-Website Pages
import { NexalusInnovationsAboutPage } from './pages/public/nexalus-innovations/NexalusInnovationsAboutPage';
import { NexalusInnovationsProductsPage } from './pages/public/nexalus-innovations/NexalusInnovationsProductsPage';
import { NexalusInnovationsServicesPage } from './pages/public/nexalus-innovations/NexalusInnovationsServicesPage';
import { NexalusInnovationsContactPage } from './pages/public/nexalus-innovations/NexalusInnovationsContactPage';

// A.M. Distributors Chiplun Sub-Website Pages
import { AmDistributorsAboutPage } from './pages/public/am-distributors/AmDistributorsAboutPage';
import { AmDistributorsProductsPage } from './pages/public/am-distributors/AmDistributorsProductsPage';
import { AmDistributorsServicesPage } from './pages/public/am-distributors/AmDistributorsServicesPage';
import { AmDistributorsContactPage } from './pages/public/am-distributors/AmDistributorsContactPage';

const MobileRouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration to ensure fresh view from top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const isMobile = window.innerWidth < 768;

    let isReload = false;
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        isReload = (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
      } else if ((window.performance as any)?.navigation?.type === 1) {
        isReload = true;
      }
    } catch {
      // ignore
    }

    const isNewSession = !sessionStorage.getItem('nexalus_session_active');
    sessionStorage.setItem('nexalus_session_active', 'true');

    // On mobile: after refresh or when reopening the site, always show the home page '/'
    if (isMobile && (isReload || isNewSession)) {
      if (location.pathname !== '/' && !location.pathname.startsWith('/admin')) {
        navigate('/', { replace: true });
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <MobileRouteHandler />
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <CartDrawer />
            <Routes>
            {/* Corporate Parent Portal Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/services" element={<SolutionsPage />} />
              <Route path="/solutions" element={<Navigate to="/services" replace />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/projects" element={<Navigate to="/products" replace />} />
              <Route path="/quote" element={<QuotePage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Nexalus Innovations Sub-Website Portal */}
            <Route path="/brands/nexalus-innovations" element={<NexalusInnovationsLayout />}>
              <Route index element={<NexalusInnovationsPage />} />
              <Route path="about" element={<NexalusInnovationsAboutPage />} />
              <Route path="products" element={<NexalusInnovationsProductsPage />} />
              <Route path="services" element={<NexalusInnovationsServicesPage />} />
              <Route path="contact" element={<NexalusInnovationsContactPage />} />
            </Route>

            {/* A.M. Distributors Chiplun Sub-Website Portal */}
            <Route path="/brands/am-distributors" element={<AmDistributorsLayout />}>
              <Route index element={<AmDistributorsPage />} />
              <Route path="about" element={<AmDistributorsAboutPage />} />
              <Route path="products" element={<AmDistributorsProductsPage />} />
              <Route path="services" element={<AmDistributorsServicesPage />} />
              <Route path="contact" element={<AmDistributorsContactPage />} />
            </Route>

            {/* Sub-Website Direct Route Aliases */}
            <Route path="/nexalus-innovations" element={<Navigate to="/brands/nexalus-innovations" replace />} />
            <Route path="/nexalus-innovations/*" element={<Navigate to="/brands/nexalus-innovations" replace />} />
            <Route path="/divisions/nexalus-innovations" element={<Navigate to="/brands/nexalus-innovations" replace />} />
            <Route path="/am-distributors" element={<Navigate to="/brands/am-distributors" replace />} />
            <Route path="/am-distributors/*" element={<Navigate to="/brands/am-distributors" replace />} />
            <Route path="/divisions/am-distributors" element={<Navigate to="/brands/am-distributors" replace />} />
            <Route path="/cp-plus/*" element={<Navigate to="/brands/nexalus-innovations/products" replace />} />
            <Route path="/one-broadband/*" element={<Navigate to="/brands/nexalus-innovations/services" replace />} />
            <Route path="/networking/*" element={<Navigate to="/brands/nexalus-innovations/services" replace />} />
            <Route path="/itti-networking/*" element={<Navigate to="/brands/nexalus-innovations/services" replace />} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Back-Office */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="plans" element={<AdminPlansPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="enquiries" element={<AdminEnquiriesPage />} />
              <Route path="service-areas" element={<AdminServiceAreasPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="faqs" element={<AdminFaqsPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="team" element={<AdminTeamPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="seo" element={<AdminSeoPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* Global 404 Catch-All (Wrapped in Public Layout - Must be last route) */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
