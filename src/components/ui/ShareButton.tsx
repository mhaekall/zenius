import { useState } from 'react';
import { Share2, Check, X, Copy, MessageCircle, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  themeColor?: string;
  variant?: 'icon' | 'full';
  onShare?: () => void;
  storeName?: string;
  storeLogo?: string;
  productCount?: number;
  previewImage?: string;
}

// Robust clipboard copy function
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through
    }
  }
  
  return new Promise((resolve) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve(successful);
    } catch {
      document.body.removeChild(textarea);
      resolve(false);
    }
  });
};

export function ShareButton({
  url,
  title,
  text,
  themeColor = '#F59E0B',
  variant = 'full',
  onShare,
  storeName,
  storeLogo,
  productCount,
  previewImage,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
  };
  
  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShare = () => {
    if (onShare) onShare();
    setShowModal(true);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
      setShowModal(false);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={handleShare}
          className="w-[34px] h-[34px] rounded-full bg-[#EEECEA] flex items-center justify-center text-[#1C1917] ios-press"
        >
          {copied ? <Check className="w-4 h-4 text-[#34C759]" /> : <Share2 className="w-4 h-4" />}
        </motion.button>

        {/* Modal */}
        <ShareModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          url={url}
          title={title}
          text={text}
          themeColor={themeColor}
          storeName={storeName}
          storeLogo={storeLogo}
          productCount={productCount}
          previewImage={previewImage}
          copied={copied}
          onCopy={handleCopy}
          onWhatsApp={handleWhatsApp}
          onTelegram={handleTelegram}
          onNativeShare={handleNativeShare}
        />
      </>
    );
  }

  return (
    <>
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

      {/* Modal */}
      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        url={url}
        title={title}
        text={text}
        themeColor={themeColor}
        storeName={storeName}
        storeLogo={storeLogo}
        productCount={productCount}
        previewImage={previewImage}
        copied={copied}
        onCopy={handleCopy}
        onWhatsApp={handleWhatsApp}
        onTelegram={handleTelegram}
        onNativeShare={handleNativeShare}
      />
    </>
  );
}

// Modern Share Preview Modal Component
function ShareModal({
  isOpen,
  onClose,
  url,
  title,
  text,
  themeColor = '#6366f1',
  storeName,
  storeLogo,
  productCount,
  previewImage,
  copied,
  onCopy,
  onWhatsApp,
  onTelegram,
  onNativeShare,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  text: string;
  themeColor?: string;
  storeName?: string;
  storeLogo?: string;
  productCount?: number;
  previewImage?: string;
  copied: boolean;
  onCopy: () => void;
  onWhatsApp: () => void;
  onTelegram: () => void;
  onNativeShare: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Bagikan Katalog</h3>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Preview Card - Modern Linktree Style */}
            <div className="p-4">
              <div 
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white"
                style={{ 
                  background: previewImage 
                    ? `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6)), url(${previewImage})`
                    : `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`
                }}
              >
                {/* Store Info */}
                <div className="flex items-center gap-3 mb-4">
                  {storeLogo ? (
                    <img 
                      src={storeLogo} 
                      alt={storeName}
                      className="w-12 h-12 rounded-xl object-cover shadow-lg"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg"
                      style={{ background: themeColor }}
                    >
                      {storeName?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{storeName || title}</h4>
                    {productCount !== undefined && (
                      <p className="text-sm text-white/80">{productCount} produk tersedia</p>
                    )}
                  </div>
                </div>
                
                {/* URL Display */}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                  <Link2 className="w-4 h-4 text-white/80 flex-shrink-0" />
                  <span className="text-sm text-white/90 truncate flex-1">{url}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="px-4 pb-4 space-y-3">
              {/* Copy Link Button */}
              <button
                onClick={onCopy}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold transition-all active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
              
              {/* Social Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onWhatsApp}
                  className="flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-2xl font-medium transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={onTelegram}
                  className="flex items-center justify-center gap-2 py-3 bg-[#0088CC] hover:bg-[#0077B3] text-white rounded-2xl font-medium transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>Telegram</span>
                </button>
              </div>
              
              {/* Native Share (Mobile) */}
              {typeof navigator.share === 'function' && (
                <button
                  onClick={onNativeShare}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-medium transition-all active:scale-[0.98]"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Lainnya</span>
                </button>
              )}
            </div>
            
            {/* Safe Area Padding for iOS */}
            <div className="h-safe pb-2" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
