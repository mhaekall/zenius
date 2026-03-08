import { Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
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
              setSearchParams({ add: 'true' });
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
          className="flex items-center justify-between px-1.5 py-1 rounded-[28px] glass-thick border border-[#E8E6E1]/60 shadow-ios-lg"
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
                      layoutId="active-nav-warm"
                      className="absolute inset-0 bg-[#EEECEA] rounded-[22px] -z-10"
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    <item.icon 
                      className={cn(
                        "w-[22px] h-[22px] mb-0.5 transition-colors duration-300", 
                        isActive ? "text-[#1C1917]" : "text-[#A8A29E] group-hover:text-[#78716C]"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    <span 
                      className={cn(
                        "text-[11px] font-bold tracking-tight transition-colors duration-300",
                        isActive ? "text-[#1C1917]" : "text-[#A8A29E] group-hover:text-[#78716C]"
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