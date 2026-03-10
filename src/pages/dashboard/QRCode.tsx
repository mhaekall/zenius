import { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Share2, Palette, Image as ImageIcon, FileText, ChevronRight } from 'lucide-react';
import { toBlob } from 'html-to-image';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components/ui';
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
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // Customization States
  const [qrColor, setQrColor] = useState('#1C1917');
  const [bgColor, setBgColor] = useState('#FAFAF8');
  const [showLogo, setShowLogo] = useState(true);

  // Sync initial color with store theme once it loads
  useEffect(() => {
    if (store?.theme_color) {
      setQrColor(store.theme_color);
    }
  }, [store?.theme_color]);

  if (!store) return null;

  const catalogUrl = `${window.location.origin}/c/${store.slug}`;

  const downloadQR = async () => {
    if (!qrRef.current) return;
    const toastId = toast.loading('Menyiapkan gambar...');
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      const blob = await toBlob(qrRef.current, { 
        pixelRatio: 3,
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
    }
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) return;
    const toastId = toast.loading('Membuat desain poster PDF...');
    
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      pdfRef.current.style.display = 'flex';
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 3,
        useCORS: true,
      });
      
      pdfRef.current.style.display = 'none';

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Poster-QR-${store.name}.pdf`);
      
      toast.success('Poster PDF berhasil dibuat!', { id: toastId });
    } catch (error) {
      toast.error('Gagal membuat PDF', { id: toastId });
      console.error(error);
      if (pdfRef.current) pdfRef.current.style.display = 'none';
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
          <Button onClick={downloadQR} className="w-full py-3.5 text-base shadow-ios-sm ios-press">
            <Download className="w-5 h-5 mr-2" /> Download PNG
          </Button>
          
          <Button variant="secondary" onClick={downloadPDF} className="w-full py-3.5 text-base shadow-ios-sm ios-press bg-[#EEECEA] text-[#1C1917]">
            <FileText className="w-5 h-5 mr-2" /> Buat Poster PDF
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

      {/* Hidden Poster Template for PDF Generation */}
      <div className="fixed top-[-9999px] left-[-9999px] z-[-1] pointer-events-none opacity-0">
        <div 
          ref={pdfRef}
          className="w-[800px] h-[1130px] flex flex-col items-center bg-[#FAFAF8] relative overflow-hidden"
          style={{ display: 'none' }}
        >
          {/* Top Decoration */}
          <div 
            className="absolute top-0 left-0 w-full h-64"
            style={{ backgroundColor: store.theme_color || '#F59E0B' }}
          >
            <svg className="absolute bottom-0 left-0 w-full h-24 text-[#FAFAF8]" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>

          {/* Content */}
          <div className="z-10 flex flex-col items-center mt-20 w-full px-16">
            {store.logo_url && (
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white p-2 shadow-xl mb-6 border-4" style={{ borderColor: store.theme_color || '#F59E0B' }}>
                <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full" crossOrigin="anonymous" />
              </div>
            )}
            
            <h1 className="text-6xl font-black text-white mb-2 text-center" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              {store.name}
            </h1>
          </div>

          <div className="z-10 mt-24 bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center border border-gray-100">
            <p className="text-2xl font-bold text-gray-800 mb-8 uppercase tracking-widest">Scan Untuk Melihat Menu</p>
            
            <div className="p-4 rounded-3xl" style={{ backgroundColor: bgColor, border: `4px solid ${qrColor}20` }}>
              <QRCodeSVG
                value={catalogUrl}
                size={400}
                bgColor={bgColor}
                fgColor={qrColor}
                level="H"
                imageSettings={
                  showLogo && store.logo_url
                    ? {
                        src: store.logo_url,
                        height: 90,
                        width: 90,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>

            <div className="mt-8 flex items-center gap-4 bg-gray-50 px-8 py-4 rounded-full border border-gray-200">
              <span className="text-xl font-medium text-gray-500">Atau kunjungi:</span>
              <span className="text-xl font-bold text-gray-900">openmenu.app/{store.slug}</span>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="absolute bottom-10 text-center w-full">
            <p className="text-[#A8A29E] text-lg font-medium">Pesan dari meja Anda • Tanpa download aplikasi</p>
          </div>
        </div>
      </div>
    </>
  );
}