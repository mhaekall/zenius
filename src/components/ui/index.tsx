import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// ============================================
// ENHANCED BUTTON - Apple-style with haptic feedback
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-[#1C1917] hover:bg-[#0C0A09] text-white shadow-ios-sm',
  secondary: 'bg-[#EEECEA] hover:bg-[#E8E6E1] text-[#1C1917]',
  ghost: 'hover:bg-[#F5F4F0] text-[#78716C]',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  outline: 'border border-[#E8E6E1] hover:bg-[#F5F4F0] text-[#1C1917] bg-[#FAFAF8]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3.5 text-base font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
        'active:scale-[0.97] hover:scale-[1.02]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {loading && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center"
        >
          <svg className="animate-spin -ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </motion.span>
      )}
      {children}
    </motion.button>
  );
}

// ============================================
// ENHANCED INPUT - Better focus states & mobile
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    const [focused, setFocused] = React.useState(false);
    
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <motion.label 
            htmlFor={inputId} 
            className="text-sm font-medium text-gray-700"
            animate={{ 
              color: focused ? '#1C1917' : '#374151',
            }}
          >
            {label}
          </motion.label>
        )}
        <motion.div className="relative">
          <input
            ref={ref}
            id={inputId}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full rounded-[14px] border-0 bg-[#EEECEA] px-3.5 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] transition-all duration-200',
              'focus:outline-none',
              focused 
                ? 'ring-2 ring-amber-400 ring-offset-1 bg-[#E8E6E1] shadow-sm' 
                : 'focus:ring-2 focus:ring-amber-400',
              error && 'ring-2 ring-red-400 focus:ring-red-400',            
              className
            )}
            {...props}
          />
          <motion.div
            className="absolute inset-0 rounded-[14px] pointer-events-none"
            initial={false}
            animate={{
              boxShadow: focused ? '0 0 0 2px rgba(245, 158, 11, 0.3)' : 'none'
            }}
            transition={{ duration: 0.15 }}
          />
        </motion.div>
        {hint && !error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-500"
          >
            {hint}
          </motion.p>
        )}
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================
// TEXTAREA - Enhanced
// ============================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={cn(
            'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ============================================
// SMART IMAGE - Lazy loading with blur placeholder
// ============================================
interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
}

export function SmartImage({ 
  src, 
  alt, 
  className,
  placeholder,
  ...props 
}: SmartImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  
  return (
    <div className={cn('relative overflow-hidden bg-[#EEECEA]', className)}>
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: loaded ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {placeholder ? (
          <img src={placeholder} alt="" className="w-full h-full object-cover blur-xl scale-110" />
        ) : (
          <div className="w-full h-full shimmer" />
        )}
      </motion.div>
      
      <motion.img
        src={error ? '/placeholder-product.png' : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={cn('relative z-0', className)}
        {...props}
      />
    </div>
  );
}

// ============================================
// EMPTY STATE - Emotional and informative
// ============================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {icon && (
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="w-16 h-16 rounded-full bg-[#EEECEA] flex items-center justify-center mb-4 text-[#A8A29E]"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-[#1C1917] mb-2">{title}</h3>
      <p className="text-sm text-[#78716C] max-w-xs mb-6">{description}</p>
      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 bg-[#1C1917] text-white rounded-xl font-medium text-sm shadow-lg shadow-black/10 hover:bg-[#0C0A09] transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

// ============================================
// CARD - Enhanced with press feedback
// ============================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function Card({ children, className, onClick, interactive = true }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileTap={onClick && interactive ? { scale: 0.98 } : undefined}
      className={cn(
        'bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm',
        onClick && interactive && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// BADGE - Enhanced with subtle animations
// ============================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'gray' | 'amber';
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[variant])}
    >
      {children}
    </motion.span>
  );
}

// ============================================
// MODAL - Better animations
// ============================================
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
          onClick={onClose} 
        />

        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          className={cn(
            'relative bg-[#FAFAF8] w-full h-[92vh] sm:h-auto sm:max-w-md rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col',
            className
          )}
        >
          <div className="sm:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
              <motion.button 
                onClick={onClose} 
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 pb-10 sm:pb-6 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ============================================
// SPINNER - Enhanced
// ============================================
export function Spinner({ className }: { className?: string }) {
  return (
    <motion.svg 
      className={cn('animate-spin h-5 w-5 text-amber-600', className)} 
      fill="none" 
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </motion.svg>
  );
}
