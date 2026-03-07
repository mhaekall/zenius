import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  QrCode,
  User,
  ExternalLink,
  Store,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
}

export function DashboardLayout({ children, activeHref }: DashboardLayoutProps) {
  const { store } = useAuthStore();
  const navItems = [
    { icon: LayoutDashboard, label: 'Beranda', href: '/dashboard' },
    { icon: Package, label: 'Produk', href: '/dashboard/products' },
    { icon: QrCode, label: 'QR Code', href: '/dashboard/qrcode' },
    { icon: User, label: 'Profil', href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative pb-24">
      {/* Main Content Area */}
      <main className="p-4 md:p-6 lg:max-w-2xl lg:mx-auto pt-6">
        {children}
      </main>

      {/* Persistent Floating Action Buttons (Outside transition area) */}
      <div className="fixed bottom-20 right-6 z-40">
        {/* FAB for Dashboard Home: View Store */}
        {activeHref === '/dashboard' && store && (
          <a href={`${window.location.origin}/c/${store.slug}`} target="_blank" rel="noopener noreferrer">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-black text-white rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center border border-white/10"
            >
              <Store className="w-5 h-5" />
            </motion.div>
          </a>
        )}

        {/* FAB for Products Page: Add Product */}
        {activeHref === '/dashboard/products' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              // We use search params to trigger the modal in the Products page
              const url = new URL(window.location.href);
              url.searchParams.set('add', 'true');
              window.history.replaceState(null, '', url);
              // Trigger a re-render by navigating
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-black text-white rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center border border-white/10"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      {/* Ramping & Padat Light Mode Bottom Navigation */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-[340px] px-4 sm:px-0">
        <motion.nav 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between px-1.5 py-1 rounded-[1.75rem] bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-[0_10px_30px_rgb(0,0,0,0.06)]"
        >
          {navItems.map((item) => {
            const isActive = activeHref === item.href || 
                            (item.href === '/dashboard' && activeHref === '/dashboard/analytics');
            
            return (
              <Link key={item.href} to={item.href} className="relative flex-1 group">
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  className="flex flex-col items-center justify-center py-1.5 w-full h-full relative"
                >
                  {/* Subtle Indicator for Active Tab */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill-light"
                      className="absolute inset-0 bg-gray-100 rounded-2xl -z-10"
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    <item.icon 
                      className={cn(
                        "w-[22px] h-[22px] mb-0.5 transition-colors duration-300", 
                        isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    <span 
                      className={cn(
                        "text-[11px] font-bold tracking-tight transition-colors duration-300",
                        isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.nav>
      </div>
    </div>
  );
}