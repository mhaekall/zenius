import { useRef } from 'react';
import { QRCodeSVG } from 'react-qr-code';
import { Download, ExternalLink, Share2 } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { useAuthStore } from '../../store/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Card } from '../../components/ui';

export default function QRCodePage() {
  const { store } = useAuthStore();
  const qrRef = useRef<HTMLDivElement>(null);

  if (!store) return null;

  const catalogUrl = `${window.location.origin}/c/${store.slug}`;

  const downloadQR = async () => {
    if (!qrRef.current) return;
    const blob = await toBlob(qrRef.current, { pixelRatio: 3 });
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${store.slug}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareQR = async () => {
    if (navigator.share) {
      await navigator.share({ title: store.name, text: 'Lihat katalog saya!', url: catalogUrl });
    } else {
      navigator.clipboard.writeText(catalogUrl);
      alert('Link disalin ke clipboard!');
    }
  };

  return (
    <DashboardLayout activeHref="/dashboard/qrcode">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">QR Code Toko</h1>
        <p className="text-sm text-gray-500">Cetak atau bagikan QR Code ini ke pelanggan</p>
      </div>

      <div className="max-w-sm mx-auto">
        <Card className="p-6 text-center">
          {/* QR Code Preview (untuk download) */}
          <div
            ref={qrRef}
            className="bg-white p-6 rounded-2xl inline-block mx-auto mb-5"
            style={{ border: '2px solid #f3f4f6' }}
          >
            <QRCodeSVG
              value={catalogUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#1f2937"
              level="M"
              imageSettings={
                store.logo_url
                  ? { src: store.logo_url, x: undefined, y: undefined, height: 40, width: 40, excavate: true }
                  : undefined
              }
            />
            <p className="text-xs text-gray-400 mt-3 font-medium">{store.name}</p>
            <p className="text-xs text-gray-300">zenius.app/{store.slug}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-3">
              Scan QR ini akan membuka:{' '}
              <span className="text-violet-600 font-medium break-all">{catalogUrl}</span>
            </p>

            <Button onClick={downloadQR} className="w-full gap-2">
              <Download className="w-4 h-4" /> Download QR Code (PNG)
            </Button>

            <Button variant="outline" onClick={shareQR} className="w-full gap-2">
              <Share2 className="w-4 h-4" /> Bagikan Link
            </Button>

            <a href={catalogUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" /> Buka Katalog
              </Button>
            </a>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-5 bg-violet-50 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-violet-800 mb-2">💡 Tips Penggunaan</h3>
          <ul className="text-xs text-violet-700 space-y-1.5">
            <li>• Cetak QR Code dan tempel di meja, kasir, atau pintu masuk</li>
            <li>• Bagikan link katalog di Instagram Bio atau WhatsApp Status</li>
            <li>• QR Code akan selalu ter-update otomatis saat kamu edit produk</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
