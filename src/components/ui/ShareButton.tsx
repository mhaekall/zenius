import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  themeColor?: string;
  variant?: 'icon' | 'full';
  onShare?: () => void;
}

export function ShareButton({
  url,
  title,
  text,
  themeColor = '#F59E0B',
  variant = 'full',
  onShare,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (onShare) onShare();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  if (variant === 'icon') {
    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={handleShare}
        className="w-[34px] h-[34px] rounded-full bg-[#EEECEA] flex items-center justify-center text-[#1C1917] ios-press"
      >
        {copied ? <Check className="w-4 h-4 text-[#34C759]" /> : <Share2 className="w-4 h-4" />}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={handleShare}
      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] font-bold text-sm text-white ios-press w-full"
      style={{ background: themeColor }}
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Tersalin!' : 'Bagikan'}
    </motion.button>
  );
}