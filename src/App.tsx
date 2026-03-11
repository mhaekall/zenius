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
const Overview = lazyWithRetry(() => import('./pages/dashboard/Overview'));
const Products = lazyWithRetry(() => import('./pages/dashboard/Products'));
const Settings = lazyWithRetry(() => import('./pages/dashboard/Settings'));
const QRCodePage = lazyWithRetry(() => import('./pages/dashboard/QRCode'));

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
  
  // Logged in but no store - redirect to register to create store
  // Use location to prevent redirect loops
  if (!store && location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
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
  const outlet = useOutlet();
  
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
            {outlet}
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

    // Explicit session check - langsung cek session tanpa tunggu onAuthStateChange
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('[Auth] Initial session check:', session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          const currentStore = useAuthStore.getState().store;
          if (!currentStore || currentStore.owner_id !== session.user.id) {
            await fetchStore(session.user.id);
          }
        } else {
          setUser(null);
          useAuthStore.getState().setStore(null);
        }
      } catch (err) {
        console.error('[Auth] Error getting session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Jalankan initAuth dulu, baru mendengarkan perubahan
    initAuth();

    // Single source of truth: onAuthStateChange handles everything
    // including the initial session check via INITIAL_SESSION event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('[Auth]', event, session?.user?.email);

        // Hindari re-fetch store pada token refresh — tidak perlu
        if (event === 'TOKEN_REFRESHED') {
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          // fetchStore hanya kalau belum ada store di cache atau beda user
          const currentStore = useAuthStore.getState().store;
          if (!currentStore || currentStore.owner_id !== session.user.id) {
            await fetchStore(session.user.id);
          }
        } else {
          setUser(null);
          useAuthStore.getState().setStore(null);
        }

        // Always set loading false after first event
        setLoading(false);
      }
    );

    // Safety timeout — if onAuthStateChange never fires (offline/error)
    // release the loading gate after 2s to prevent infinite spinner
    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []); // <-- hapus dependency array agar tidak re-run

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
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/c/:slug" element={<Catalog />} />
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthInit>
    </BrowserRouter>
  );
}