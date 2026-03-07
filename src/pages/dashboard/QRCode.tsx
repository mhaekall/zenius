import { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Share2, Palette, Image as ImageIcon, FileText } from 'lucide-react';
import { toBlob } from 'html-to-image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Input } from '../../components/ui';

export default function QRCodePage() {
  const { store } = useAuthStore();
  const qrRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // Customization States
  const [qrColor, setQrColor] = useState('#1f2937');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showLogo, setShowLogo] = useState(true);

  // Sync initial color with store theme once it loads
  useEffect(() => {
    if (store?.theme_color) {
      setQrColor(store.theme_color);
    }
  }, [store?.theme_color]);

  if (!store) return null;

  const catalogUrl = `${window.location.origin}/c/${store.slug}`;

  // Fix PNG clipping by finding the exact bounding box
  const downloadQR = async () => {
    if (!qrRef.current) return;
    const toastId = toast.loading('Menyiapkan gambar...');
    try {
      // Tunggu sebentar untuk memastikan render selesai
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
      // Pastikan elemen poster ditampilkan sementara untuk di-render canvas
      pdfRef.current.style.display = 'flex';
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 3, // Kualitas tinggi
        useCORS: true, // Izinkan ambil gambar (logo) dari beda domain
      });
      
      // Sembunyikan kembali
      pdfRef.current.style.display = 'none';

      // A4 Size (210 x 297 mm)
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Hitung aspek rasio agar pas di kertas A4
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
    if (navigator.share) {
      await navigator.share({ title: store.name, text: 'Lihat katalog saya!', url: catalogUrl });
    } else {
      navigator.clipboard.writeText(catalogUrl);
      toast.success('Link disalin ke clipboard!');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Studio QR Code</h1>
        <p className="text-sm text-gray-500">Sesuaikan tampilan QR Code dengan identitas toko Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* Panel Preview & Download */}
        <Card className="p-6 text-center flex flex-col justify-center items-center">
          <div
            ref={qrRef}
            className="p-6 rounded-3xl inline-block mx-auto mb-6 transition-all duration-300"
            style={{ 
              backgroundColor: bgColor,
              border: `2px solid ${qrColor}30`,
              boxShadow: `0 20px 40px -10px ${qrColor}20` 
            }}
          >
            <QRCodeSVG
              value={catalogUrl}
              size={220}
              bgColor={bgColor}
              fgColor={qrColor}
              level="H"
              imageSettings={
                showLogo && store.logo_url
                  ? {
                      src: store.logo_url,
                      height: 54,
                      width: 54,
                      excavate: true,
                    }
                  : undefined
              }
            />
            <p className="text-sm mt-4 font-bold" style={{ color: qrColor }}>{store.name}</p>
            <p className="text-xs opacity-70" style={{ color: qrColor }}>zenius.app/{store.slug}</p>
          </div>

          <div className="w-full space-y-3 max-w-xs">
            <Button onClick={downloadQR} className="w-full gap-2 shadow-md">
              <Download className="w-4 h-4" /> Download Gambar (PNG)
            </Button>
            
            <Button variant="outline" onClick={downloadPDF} className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
              <FileText className="w-4 h-4" /> Buat Poster Meja (PDF)
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={shareQR} className="flex-1 gap-2">
                <Share2 className="w-4 h-4" /> Bagikan
              </Button>
              <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full gap-2 border-gray-200">
                  <ExternalLink className="w-4 h-4 text-gray-600" /> Buka
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Hidden Poster Template for PDF Generation */}
        <div className="fixed top-0 left-[-9999px] z-[-1] pointer-events-none">
          <div 
            ref={pdfRef}
            className="w-[800px] h-[1130px] flex flex-col items-center bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
            style={{ display: 'none' }}
          >
            {/* Top Decoration */}
            <div 
              className="absolute top-0 left-0 w-full h-64"
              style={{ backgroundColor: store.theme_color || '#6366f1' }}
            >
              <svg className="absolute bottom-0 left-0 w-full h-24 text-white" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>

            {/* Content */}
            <div className="z-10 flex flex-col items-center mt-20 w-full px-16">
              {store.logo_url && (
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white p-2 shadow-xl mb-6 border-4" style={{ borderColor: store.theme_color || '#6366f1' }}>
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
                <span className="text-xl font-bold text-gray-900">zenius.app/{store.slug}</span>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="absolute bottom-10 text-center w-full">
              <p className="text-gray-400 text-lg font-medium">Pesan dari meja Anda • Tanpa download aplikasi</p>
            </div>
          </div>
        </div>

        {/* Panel Customization */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-violet-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Warna QR Code</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-700 font-medium">Warna Garis (Foreground)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono uppercase">{qrColor}</span>
                  <input 
                    type="color" 
                    value={qrColor} 
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-700 font-medium">Warna Latar (Background)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono uppercase">{bgColor}</span>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-2">
                💡 Tips: Pastikan kontras antara warna garis dan latar cukup tinggi agar QR mudah di-scan kamera.
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Logo di Tengah</h2>
            </div>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <span className="text-sm text-gray-700 font-medium block">Tampilkan Logo Toko</span>
                <span className="text-xs text-gray-500">Sisipkan logo toko Anda di tengah QR</span>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  disabled={!store.logo_url}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </div>
            </label>
            
            {!store.logo_url && (
              <p className="text-xs text-red-500 mt-2">
                * Anda belum meng-upload logo toko. Silakan upload di menu Pengaturan.
              </p>
            )}
          </Card>

          <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
            <h3 className="text-sm font-semibold text-violet-800 mb-2">💡 Cara Penggunaan Terbaik</h3>
            <ul className="text-xs text-violet-700 space-y-1.5">
              <li>1. Sesuaikan warna QR dengan brand Anda.</li>
              <li>2. Klik <strong>Download Kualitas Tinggi</strong> (Gambar tidak akan pecah saat dicetak besar).</li>
              <li>3. Tempel di Meja Kasir, Pintu Masuk, atau kemasan produk Anda.</li>
            </ul>
          </div>
        </div>

      </div>
    </>
  );
}
