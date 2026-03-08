import { cn } from '../../lib/utils';

interface ProductPlaceholderProps {
  name: string;
  themeColor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductPlaceholder({ 
  name, 
  themeColor = '#F59E0B',
  className,
  size = 'md'
}: ProductPlaceholderProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  const sizeMap = {
    sm: 'text-lg',
    md: 'text-3xl', 
    lg: 'text-5xl'
  };

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center font-bold select-none opacity-80',
        sizeMap[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${themeColor}dd 0%, ${themeColor}88 100%)`,
        color: 'rgba(255,255,255,0.9)',
        textShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      {initial}
    </div>
  );
}