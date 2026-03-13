import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useOutlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Eagerly loaded public pages (Keep small)
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import Setup from './pages/Setup';
import FeatureMap from './pages/FeatureMap';
import BlueprintFlow from './pages/BlueprintFlow';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Support from './pages/Support';

// Custom lazy function to auto-reload if chunks are outdated (Vite PWA issue)
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Chunk loading failed, forcefully reloading...', error);
      window.location.reload();
      return { default: () => <PageLoader /> };
    }
  });

// Lazy loaded pages (Code Splitting)
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'));
const Overview = lazyWithRetry(() => import('./pages/dashboard/Overview'));
const Products = lazyWithRetry(() => import('./pages/dashboard/Products'));
const Settings = lazyWithRetry(() => import('./pages/dashboard/Settings'));
const QRCodePage = lazyWithRetry(() => import('./pages/dashboard/QRCode'));
const Upgrade = lazyWithRetry(() => import('./pages/dashboard/Upgrade'));
const Analytics = lazyWithRetry(() => import('./pages/dashboard/Analytics'));

// Performance-friendly Loading Spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
    <div className="text-center">
      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-[18px] shimmer mx-auto mb-3 shadow-ios-md" />
      <p className="text-ios-caption text-[#A8A29E] font-medium">Memuat...</p>
    </div>
  </div>
);

// Auth guard component - for routes that require authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, store, loading } = useAuthStore();
  const location = useLocation();
  
  // Show loading while checking auth
  if (loading) return <PageLoader />;
  
  // Not logged in - redirect to login
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  
  // Logged in but no store - redirect to setup to create store
  // Allow /setup route to load
  if (!store && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }
  
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  
  // While loading, render nothing — do not redirect
  if (loading) return <PageLoader />;
  
  // Only redirect if we are SURE user is authenticated
  if (user) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

// Persistent Layout Wrapper with Stabilized Transitions
function DashboardWrapper() {
  const location = useLocation();
  
  return (
    <DashboardLayout activeHref={location.pathname}>
      {/* Suspense di luar AnimatePresence agar tidak remount setiap transisi */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-6 h-6 border-2 border-[#E8E6E1] border-t-black rounded-full animate-spin" />
        </div>
      }>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }} // Snappy Apple-style easing
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </DashboardLayout>
  );
}

// Auth initializer
function AuthInit({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, fetchStore } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false; // Track if auth event has been received

    // Safety timeout — only if onAuthStateChange never fires at all
    // We give it longer now since fetchStore can take time
    const timeout = setTimeout(() => {
      if (mounted && !authEventReceived) {
        console.log('[Auth] Safety timeout reached - no auth event');
        setLoading(false);
      } else if (mounted && authEventReceived) {
        console.log('[Auth] Safety timeout - auth event received, waiting for fetchStore');
      }
    }, 5000); // Increased to 5 seconds to allow fetchStore to complete

    // Single source of truth: onAuthStateChange handles everything
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        authEventReceived = true; // Mark that we received an auth event
        console.log('[Auth]', event, session?.user?.email);

        if (session?.user) {
          setUser(session.user);
          // fetchStore only if store is missing or belongs to another user
          const currentStore = useAuthStore.getState().store;
          if (!currentStore || currentStore.owner_id !== session.user.id) {
            // Wait for fetchStore to complete before setting loading to false
            await fetchStore(session.user.id);
          }
        } else {
          setUser(null);
          useAuthStore.getState().setStore(null);
        }

        // Set loading false after processing the session AND fetchStore
        setLoading(false);
        clearTimeout(timeout);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, fetchStore]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 3000, 
          style: { borderRadius: '16px', background: '#333', color: '#fff' } 
        }} 
      />
      <AuthInit>
        <Routes>
          {/* Public Pages - Normal Suspense */}
          <Route element={<Suspense fallback={<PageLoader />}><Outlet /></Suspense>}>
            <Route path="/" element={<Landing />} />
            <Route path="/feature-map" element={<FeatureMap />} />
            <Route path="/blueprint" element={<BlueprintFlow />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/c/:slug" element={<Catalog />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
          </Route>

          {/* Dashboard - Persistent Layout */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>}
          >
            {/* The actual routes handled by the Outlet in DashboardWrapper */}
            <Route index element={<Overview />} />
            <Route path="products" element={<Products />} />
            <Route path="settings" element={<Settings />} />
            <Route path="qrcode" element={<QRCodePage />} />
            <Route path="upgrade" element={<Upgrade />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthInit>
    </BrowserRouter>
  );
}