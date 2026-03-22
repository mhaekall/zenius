import { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Share2, Palette, Image as ImageIcon, FileText } from 'lucide-react';
import { toBlob } from 'html-to-image';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui';
import { cn } from '../../lib/utils';

// Robust clipboard copy function that works in all contexts
const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try navigator.clipboard first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }
  
  // Fallback: use textarea element method
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

export default function QRCodePage() {
  const { store } = useAuthStore();
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Customization States
  const [qrColor, setQrColor] = useState('#1C1917');
  const [bgColor, setBgColor] = useState('#FAFAF8');
  const [showLogo, setShowLogo] = useState(true);
  const [qrSize, setQrSize] = useState<'S' | 'M' | 'L'>('M');

  // Download loading states
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const sizePixels = {
    S: 512,
    M: 1024,
    L: 2048
  };

  // Sync initial color with store theme once it loads
  useEffect(() => {
    if (store?.theme_color) {
      setQrColor(store.theme_color);
    }
  }, [store?.theme_color]);

  if (!store) return null;

  const catalogUrl = `${window.location.origin}/c/${store.slug}`;

  const downloadQR = async () => {
    if (!qrRef.current || downloadingPng) return;
    setDownloadingPng(true);
    const toastId = toast.loading('Menyiapkan gambar...');
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const blob = await toBlob(qrRef.current, { 
        pixelRatio: qrSize === 'S' ? 1.5 : qrSize === 'M' ? 3 : 5,
        style: {
          margin: '0',
          transform: 'none',
        }
      });
      
      if (!blob) throw new Error("Gagal membuat blob");
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${store.slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Gambar QR Code berhasil diunduh!', { id: toastId });
    } catch (error) {
      toast.error('Gagal mengunduh gambar', { id: toastId });
      console.error(error);
    } finally {
      setDownloadingPng(false);
    }
  };

  const downloadPDF = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    const toastId = toast.loading('Membuat poster PDF...');
    try {
      // A4 dimensions in points (72dpi): 595 x 842
      const pdf = new jsPDF('portrait', 'pt', 'a4');
      const W = 595;
      const H = 842;

      // Background
      pdf.setFillColor(250, 250, 248); // #FAFAF8
      pdf.rect(0, 0, W, H, 'F');

      // Header band using theme color
      const hex = store.theme_color || '#F59E0B';
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      pdf.setFillColor(r, g, b);
      pdf.rect(0, 0, W, 180, 'F');

      // Store name text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text(store.name, W / 2, 100, { align: 'center' });

      // Subtitle
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan untuk melihat menu', W / 2, 130, { align: 'center' });

      // Generate QR code as data URL using qrcode library
      const qrDataUrl = await QRCode.toDataURL(catalogUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      });

      // Draw QR code centered
      const qrCodeSize = 260;
      const qrX = (W - qrCodeSize) / 2;
      const qrY = 220;
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrCodeSize, qrCodeSize);

      // QR border box
      pdf.setDrawColor(228, 228, 225);
      pdf.setLineWidth(1);
      pdf.roundedRect(qrX - 16, qrY - 16, qrCodeSize + 32, qrCodeSize + 32, 12, 12);

      // URL text below QR
      pdf.setTextColor(28, 25, 23); // #1C1917
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`openmenu.app/${store.slug}`, W / 2, qrY + qrCodeSize + 40, { align: 'center' });

      // Footer
      pdf.setTextColor(168, 162, 158); // #A8A29E
      pdf.setFontSize(11);
      pdf.text('Pesan dari meja Anda · Tanpa download aplikasi', W / 2, H - 40, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text('Powered by OpenMenu', W / 2, H - 22, { align: 'center' });

      pdf.save(`Poster-QR-${store.name}.pdf`);
      toast.success('Poster PDF berhasil dibuat!', { id: toastId });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Gagal membuat PDF: ' + (error instanceof Error ? error.message : 'Unknown error'), { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const shareQR = async () => {
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: `${store.name} - Katalog Digital`, 
          text: `Lihat katalog ${store.name} di OpenMenu!`, 
          url: catalogUrl 
        });
        return; // Share successful
      } catch (error) {
        // User cancelled - don't do anything
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // Other error - fall through to clipboard
      }
    }
    
    // Fallback: use robust clipboard copy
    const success = await copyToClipboard(catalogUrl);
    if (success) {
      toast.success('Link disalin ke clipboard!');
    } else {
      toast.error('Gagal menyalin link');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h1 className="text-ios-title2 text-[#1C1917]">QR Code</h1>
        </div>
      </div>

      <div className="flex flex-col space-y-6 pb-10">
        
        {/* 1. Panel Preview */}
        <div className="bg-[#F5F4F0] rounded-[28px] p-6 text-center flex flex-col justify-center items-center shadow-ios-sm border border-black/[0.06]">
          <div
            ref={qrRef}
            className="p-4 rounded-[22px] inline-block mx-auto transition-all duration-300 shadow-ios-sm"
            style={{ 
              backgroundColor: bgColor,
            }}
          >
            <QRCodeSVG
              value={catalogUrl}
              size={200}
              bgColor={bgColor}
              fgColor={qrColor}
              level="H"
              imageSettings={
                showLogo && store.logo_url
                  ? {
                      src: store.logo_url,
                      height: 48,
                      width: 48,
                      excavate: true,
                    }
                  : undefined
              }
            />
          </div>
          <p className="text-sm mt-4 font-bold text-[#1C1917]">{store.name}</p>
          <p className="text-xs text-[#78716C] mt-0.5">openmenu.app/{store.slug}</p>
        </div>

        {/* 2. Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 bg-[#EEECEA] p-1 rounded-xl">
              {(['S', 'M', 'L'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setQrSize(s)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    qrSize === s ? "bg-white text-[#1C1917] shadow-sm" : "text-[#A8A29E]"
                  )}
                >
                  {s === 'S' ? 'Kecil' : s === 'M' ? 'Sedang' : 'Besar'}
                </button>
              ))}
            </div>
            <Button
              onClick={downloadQR}
              disabled={downloadingPng}
              className="w-full py-3.5 text-base shadow-ios-sm ios-press"
            >
              {downloadingPng ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Menyiapkan...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download PNG ({sizePixels[qrSize]}px)
                </>
              )}
            </Button>
          </div>
          
          <Button
            variant="secondary"
            onClick={downloadPDF}
            disabled={downloadingPdf}
            className="w-full py-3.5 text-base shadow-ios-sm ios-press bg-[#EEECEA] text-[#1C1917]"
          >
            {downloadingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1C1917]/20 border-t-[#1C1917] rounded-full animate-spin mr-2" />
                Membuat poster...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Buat Poster PDF
              </>
            )}
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={shareQR} className="flex-1 py-3.5 shadow-ios-sm ios-press border-[#E8E6E1] bg-[#FAFAF8]">
              <Share2 className="w-4 h-4 mr-2" /> Bagikan
            </Button>
            <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full py-3.5 shadow-ios-sm ios-press border-[#E8E6E1] bg-[#FAFAF8]">
                <ExternalLink className="w-4 h-4 mr-2" /> Buka
              </Button>
            </a>
          </div>
        </div>

        {/* 3. Customization Section */}
        <section>
          <h2 className="text-ios-caption uppercase tracking-widest text-[#A8A29E] mb-1.5 px-3">Kustomisasi</h2>
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden">
            
            <div className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04]">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#A8A29E]" />
                <span className="text-sm font-medium text-[#1C1917]">Warna Garis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A8A29E] font-mono uppercase">{qrColor}</span>
                <input 
                  type="color" 
                  value={qrColor} 
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-8 h-8 rounded-[8px] cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04]">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#A8A29E]" />
                <span className="text-sm font-medium text-[#1C1917]">Warna Latar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A8A29E] font-mono uppercase">{bgColor}</span>
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-[8px] cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
            </div>

            <label className="flex items-center justify-between py-3 px-4 cursor-pointer active:bg-[#EEECEA] transition-colors">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#A8A29E]" />
                <span className="text-sm font-medium text-[#1C1917]">Tampilkan Logo</span>
              </div>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  disabled={!store.logo_url}
                />
                <div className={cn(
                  "w-11 h-6 rounded-full transition-colors duration-200",
                  showLogo ? "bg-[#34C759]" : "bg-[#EEECEA]"
                )}>
                  <span className={cn(
                    "inline-block h-5 w-5 mt-0.5 ml-0.5 bg-white rounded-full shadow-ios-sm transition-transform duration-200",
                    showLogo ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </div>
            </label>
            {!store.logo_url && (
              <div className="px-4 py-2 bg-[#FEF3C7] border-t border-[#FDE68A]">
                <p className="text-xs text-amber-700">Logo belum diupload. Silakan ke menu Pengaturan.</p>
              </div>
            )}
          </div>
        </section>

        {/* 4. Tips */}
        <div className="bg-[#EEECEA] rounded-[18px] p-4">
          <h3 className="text-sm font-semibold text-[#1C1917] mb-2">Tips Penggunaan</h3>
          <ul className="text-xs text-[#78716C] space-y-1.5 list-disc list-inside pl-4">
            <li>Pastikan kontras warna cukup tinggi agar mudah di-scan.</li>
            <li>Gunakan PDF untuk dicetak dan diletakkan di meja kasir.</li>
          </ul>
        </div>
      </div>
    </>
  );
}