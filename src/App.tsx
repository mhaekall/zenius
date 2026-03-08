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

// Lazy loaded pages (Code Splitting)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const Products = lazy(() => import('./pages/dashboard/Products'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const QRCodePage = lazy(() => import('./pages/dashboard/QRCode'));

// Performance-friendly Loading Spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
    <div className="text-center">
      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl animate-pulse mx-auto mb-3" />
      <p className="text-xs text-gray-400 font-medium">Memuat...</p>
    </div>
  </div>
);

// Auth guard component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Persistent Layout Wrapper with Stabilized Transitions
function DashboardWrapper() {
  const location = useLocation();
  const outlet = useOutlet();
  
  return (
    <DashboardLayout activeHref={location.pathname}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }} // Snappy Apple-style easing
          className="w-full"
        >
          {/* Ensure the lazy Suspense is inside the animated div */}
          <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>}>
            {outlet}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}

// Auth initializer
function AuthInit({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, fetchStore } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
           console.error("Supabase auth error:", error);
           setUser(null);
           return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchStore(session.user.id);
        } else {
          setUser(null);
        }
      } catch (err) {
         console.error("Init auth error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes (ignoring the initial event as getSession handles it)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'INITIAL_SESSION') return;
      
      if (session?.user) {
        setUser(session.user);
        await fetchStore(session.user.id);
      } else {
        setUser(null);
      }
      
      if (mounted) {
         setLoading(false);
      }
    });

    return () => {
      mounted = false;
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