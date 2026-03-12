import { useState } from "react";

const FLOWS = {
  user: {
    label: "User Flow",
    color: "#F59E0B",
    nodes: [
      {
        id: "u1", type: "start", label: "Scan QR / Buka Link",
        sub: "Entry point pelanggan",
      },
      {
        id: "u2", type: "page", label: "Halaman Katalog",
        sub: "/c/:slug — SSR rendered",
        checks: ["Toko aktif?", "Load < 2s?"],
      },
      {
        id: "u3", type: "branch", label: "Toko Ditemukan?",
        yes: "u4", no: "u_404",
      },
      {
        id: "u_404", type: "dead", label: "404 — Toko Tidak Aktif",
        sub: "Halaman error friendly",
      },
      {
        id: "u4", type: "page", label: "Browse Produk",
        sub: "Filter kategori, lihat harga",
        checks: ["Image lazy load", "Skeleton UI ready"],
      },
      {
        id: "u5", type: "action", label: "Tambah ke Keranjang",
        sub: "Cart state persisted (Zustand)",
        checks: ["Haptic feedback", "Badge count update"],
      },
      {
        id: "u6", type: "action", label: "Buka Keranjang",
        sub: "Bottom sheet — review order",
      },
      {
        id: "u7", type: "action", label: "Pesan via WhatsApp",
        sub: "Format pesan otomatis + total",
        checks: ["Format rupiah benar", "Nama toko included", "Link katalog di pesan"],
      },
      {
        id: "u8", type: "end", label: "WA Terbuka — Order Terkirim",
        sub: "Cart di-clear otomatis",
      },
    ],
    edges: ["u1→u2","u2→u3","u3→u4","u3→u_404","u4→u5","u5→u6","u6→u7","u7→u8"],
  },
  owner: {
    label: "Owner Flow",
    color: "#10B981",
    nodes: [
      {
        id: "o1", type: "start", label: "Landing Page",
        sub: "zenius.app — CTA Daftar Gratis",
      },
      {
        id: "o2", type: "action", label: "Registrasi",
        sub: "Email / Google OAuth",
        checks: ["Validasi WA number", "Auto-generate slug", "< 3 field di mobile"],
      },
      {
        id: "o3", type: "branch", label: "Toko Sudah Ada?",
        yes: "o5", no: "o4",
      },
      {
        id: "o4", type: "action", label: "Setup Toko Pertama",
        sub: "Nama, WA, warna — 60 detik",
        checks: ["Preview slug realtime", "Onboard < 5 menit total"],
      },
      {
        id: "o5", type: "page", label: "Dashboard Overview",
        sub: "Insight card + metrics",
        checks: ["North star metric visible", "1 actionable insight", "Tombol Bantuan CS"],
      },
      {
        id: "o6", type: "action", label: "Tambah Produk",
        sub: "Foto, nama, harga, kategori",
        checks: ["Image compress otomatis (Max 200KB)", "Preview sebelum publish", "Limit indicator UI"],
      },
      {
        id: "o7", type: "action", label: "Lihat / Share Katalog",
        sub: "Copy link atau QR Code",
        checks: ["OG meta tags correct", "Aha Moment Tracker", "QR download PNG / PDF"],
      },
      {
        id: "o8", type: "branch", label: "Butuh Fitur Premium?",
        yes: "o9", no: "o10",
      },
      {
        id: "o9", type: "action", label: "Upgrade ke Juragan/Bos",
        sub: "Xendit — QRIS / VA / e-wallet",
        checks: ["Webhook subscription update", "Instant unlock fitur"],
      },
      {
        id: "o10", type: "end", label: "Toko Live & Aktif",
        sub: "Watermark Zenius = referral engine",
      },
    ],
    edges: ["o1→o2","o2→o3","o3→o4","o3→o5","o4→o5","o5→o6","o6→o7","o7→o8","o8→o9","o8→o10","o9→o10"],
  },
};

const PHASES = [
  {
    id: "p0",
    label: "Phase 0",
    title: "Security & Foundation",
    color: "#EF4444",
    timeline: "Minggu 1-2",
    tasks: [
      { id: "t01", label: "Rotate semua credentials", detail: "DB pass, GitHub PAT, Figma token", done: false, critical: true },
      { id: "t02", label: "mcp-master-config.json → .gitignore", detail: "Buat .env.example template", done: true, critical: true },
      { id: "t03", label: "Setup Sentry free tier", detail: "Error tracking sebelum launch", done: false, critical: false },
      { id: "t04", label: "Deploy ke Cloudflare Pages", detail: "$0, edge network Jakarta", done: false, critical: false },
      { id: "t05", label: "Image Compression Engine", detail: "Cegah storage jebol (Max 200KB per foto)", done: false, critical: true },
    ],
  },
  {
    id: "p1",
    label: "Phase 1",
    title: "Onboarding Obsession",
    color: "#F59E0B",
    timeline: "Minggu 3-4",
    tasks: [
      { id: "t11", label: "Test onboarding di HP Android nyata", detail: "Bukan simulator — Chrome Android", done: false, critical: true },
      { id: "t12", label: "Aha Moment Tracker", detail: "Event trigger saat katalog pertama di-share", done: false, critical: true },
      { id: "t13", label: "Watermark referral mechanism", detail: "'Buat tokomu di Zenius' di katalog free", done: false, critical: false },
      { id: "t14", label: "Floating FAB Support", detail: "User bisa tanya via WA saat bingung", done: false, critical: true },
      { id: "t15", label: "Offline-friendly loading", detail: "Service worker dasar / fallback UI", done: false, critical: false },
    ],
  },
  {
    id: "p2",
    label: "Phase 2",
    title: "First 10 Users",
    color: "#10B981",
    timeline: "Bulan 2",
    tasks: [
      { id: "t21", label: "Identifikasi 10 UMKM target manual", detail: "Warung, toko IG, reseller lokal", done: false, critical: true },
      { id: "t22", label: "Onboard personal via WhatsApp", detail: "Bukan automated — 1-on-1", done: false, critical: true },
      { id: "t23", label: "Track north star metric harian", detail: "Toko yang dapat WA order dalam 7 hari", done: false, critical: true },
      { id: "t24", label: "Metabase / Looker Studio setup", detail: "Daripada buat Super Admin UI", done: false, critical: false },
      { id: "t25", label: "Build in public — Twitter/TikTok", detail: "Demo 3-menit buat katalog", done: false, critical: false },
    ],
  },
  {
    id: "p3",
    label: "Phase 3",
    title: "First Revenue",
    color: "#8B5CF6",
    timeline: "Bulan 3",
    tasks: [
      { id: "t31", label: "Aktifkan Xendit payment", detail: "QRIS + VA untuk Juragan plan", done: false, critical: true },
      { id: "t32", label: "Freemium gate implementation", detail: "20 produk limit + watermark free", done: false, critical: true },
      { id: "t33", label: "Upgrade flow in-app", detail: "Smooth upsell tanpa friction", done: false, critical: false },
      { id: "t34", label: "Case study toko pertama", detail: "Screenshot + cerita sukses untuk marketing", done: false, critical: false },
      { id: "t35", label: "Webhook subscription handler", detail: "Supabase update setelah Xendit callback", done: false, critical: false },
    ],
  },
  {
    id: "p4",
    label: "Phase 4",
    title: "Scale Foundation",
    color: "#0EA5E9",
    timeline: "Bulan 4-6",
    tasks: [
      { id: "t41", label: "TanStack Start migration", detail: "Trigger: SEO complaint nyata dari user", done: false, critical: false },
      { id: "t42", label: "Custom domain untuk Juragan/Bos", detail: "CNAME setup via Cloudflare", done: false, critical: false },
      { id: "t43", label: "Multi-toko untuk Bos plan", detail: "Max 3 toko per akun", done: false, critical: false },
      { id: "t44", label: "Analytics export (CSV)", detail: "Fitur premium — nilai tinggi, effort rendah", done: false, critical: false },
      { id: "t45", label: "Drizzle ORM evaluation", detail: "Trigger: query cross-store diperlukan", done: false, critical: false },
    ],
  },
];

// ─── Node Component ───────────────────────────────────────────────
function FlowNode({ node, color, isActive, onClick }: { node: any, color: string, isActive: boolean, onClick: (n: any) => void }) {
  const typeStyles: Record<string, any> = {
    start:  { bg: color, text: "#fff", shape: "rounded-full px-4" },
    end:    { bg: color + "22", text: color, shape: "rounded-full px-4 border-2", borderColor: color },
    page:   { bg: "#1C1917", text: "#fff", shape: "rounded-2xl" },
    action: { bg: "#F5F4F0", text: "#1C1917", shape: "rounded-2xl border border-black/10" },
    branch: { bg: "#fff", text: "#1C1917", shape: "rounded-lg border-2 rotate-[0deg]", borderColor: color },
    dead:   { bg: "#FEE2E2", text: "#991B1B", shape: "rounded-2xl border border-red-200" },
  };

  const s = typeStyles[node.type] || typeStyles.action;

  return (
    <div
      onClick={() => onClick(node)}
      className={`relative cursor-pointer transition-all duration-200 ${isActive ? "scale-105" : "hover:scale-102"}`}
      style={{ filter: isActive ? `drop-shadow(0 0 12px ${color}66)` : "none" }}
    >
      <div
        className={`px-4 py-2.5 min-w-[160px] max-w-[200px] text-center ${s.shape}`}
        style={{
          background: s.bg,
          color: s.text,
          border: s.borderColor ? `2px solid ${s.borderColor}` : undefined,
        }}
      >
        <div className="text-[13px] font-bold leading-tight">{node.label}</div>
        {node.sub && (
          <div className="text-[10px] mt-0.5 opacity-70 leading-tight">{node.sub}</div>
        )}
        {node.type === "branch" && (
          <div className="text-[9px] mt-1 opacity-50 uppercase tracking-widest">Decision</div>
        )}
      </div>

      {/* Checks tooltip */}
      {isActive && node.checks && (
        <div
          className="absolute left-full ml-3 top-0 z-50 bg-white rounded-xl shadow-xl border border-black/8 p-3 min-w-[180px]"
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color }}>
            Dev Checkpoints
          </div>
          {node.checks.map((c: string, i: number) => (
            <div key={i} className="flex items-start gap-1.5 mb-1">
              <span className="text-[10px] mt-0.5" style={{ color }}>✓</span>
              <span className="text-[11px] text-gray-700">{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────
function TaskCard({ task, color, onToggle }: { task: any, color: string, onToggle: (id: string) => void }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer
        ${task.done ? "opacity-50" : "hover:bg-black/5"}`}
      onClick={() => onToggle(task.id)}
    >
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
        style={{
          borderColor: task.done ? color : "#D1D5DB",
          background: task.done ? color : "transparent",
        }}
      >
        {task.done && <span className="text-white text-[10px]">✓</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[13px] font-semibold ${task.done ? "line-through text-gray-400" : "text-gray-900"}`}>
            {task.label}
          </span>
          {task.critical && !task.done && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: color + "22", color }}
            >
              Critical
            </span>
          )}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">{task.detail}</div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function ZeniusFlowchart() {
  const [activeFlow, setActiveFlow] = useState("user");
  const [activeView, setActiveView] = useState("flow"); // flow | tasks
  const [activeNode, setActiveNode] = useState<any>(null);
  const [activePhase, setActivePhase] = useState("p0");
  const [tasks, setTasks] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    PHASES.forEach(p => p.tasks.forEach(t => { map[t.id] = t.done; }));
    return map;
  });

  const flow = FLOWS[activeFlow as keyof typeof FLOWS];

  const toggleTask = (id: string) => {
    setTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProgress = (phase: any) => {
    const done = phase.tasks.filter((t: any) => tasks[t.id]).length;
    return Math.round((done / phase.tasks.length) * 100);
  };

  const totalTasks = PHASES.reduce((s, p) => s + p.tasks.length, 0);
  const totalDone = PHASES.reduce((s, p) => s + p.tasks.filter(t => tasks[t.id]).length, 0);

  // Build sequential order (filter out branches/dead for linear display)
  const linearNodes = flow?.nodes || [];

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-sm font-black"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>Z</div>
            <span className="font-black text-[#1C1917] tracking-tight">Zenius</span>
            <span className="text-xs text-[#A8A29E] ml-1">Blueprint</span>
          </div>

          <div className="flex items-center gap-1 bg-[#EEECEA] rounded-xl p-1">
            {["flow", "tasks"].map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className="px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all"
                style={{
                  background: activeView === v ? "#1C1917" : "transparent",
                  color: activeView === v ? "#fff" : "#78716C",
                }}
              >
                {v === "flow" ? "User Flow" : "Dev Tasks"}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#A8A29E] font-medium hidden sm:block">
            {totalDone}/{totalTasks} tasks done
          </div>
        </div>
      </div>

      {/* FLOW VIEW */}
      {activeView === "flow" && (
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
            {/* Sidebar Flow Selector */}
            <div className="w-full md:w-48 flex-shrink-0">
                <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {Object.entries(FLOWS).map(([key, f]) => (
                    <button
                    key={key}
                    onClick={() => { setActiveFlow(key); setActiveNode(null); }}
                    className="flex-shrink-0 md:w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                        background: activeFlow === key ? f.color : "#EEECEA",
                        color: activeFlow === key ? "#fff" : "#78716C",
                    }}
                    >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: activeFlow === key ? "#fff" : f.color }} />
                    {f.label}
                    </button>
                ))}
                </div>

                {/* Legend */}
                <div className="hidden md:block mt-8 p-4 bg-white rounded-xl border border-black/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] mb-3">Legend</div>
                    <div className="flex flex-col gap-3 text-[11px]">
                    {[
                        { shape: "rounded-full", bg: flow.color, label: "Start/End", text: "#fff" },
                        { shape: "rounded-xl", bg: "#1C1917", label: "Page/Route", text: "#fff" },
                        { shape: "rounded-xl", bg: "#F5F4F0", label: "User Action", text: "#1C1917", border: true },
                        { shape: "rounded-lg", bg: "#fff", label: "Decision", text: "#1C1917", border2: flow.color },
                    ].map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${l.shape} flex items-center justify-center`}
                            style={{
                            background: l.bg,
                            border: l.border2 ? `2px solid ${l.border2}` : l.border ? "1px solid rgba(0,0,0,0.1)" : "none"
                            }} />
                        <span className="text-[#78716C]">{l.label}</span>
                        </div>
                    ))}
                    </div>
                </div>
            </div>

          {/* Flow diagram */}
          <div className="flex-1 relative overflow-x-auto min-h-[70vh] flex justify-center py-4">
            <div className="flex flex-col items-center gap-0">
              {linearNodes.map((node, idx) => {
                const isActive = activeNode?.id === node.id;
                const showArrow = idx < linearNodes.length - 1 && node.type !== "dead";

                return (
                  <div key={node.id} className="flex flex-col items-center">
                    {/* Branch label */}
                    {idx > 0 && linearNodes[idx - 1]?.type === "branch" && (
                      <div className="text-[10px] font-bold mb-1 px-2 py-0.5 rounded-full"
                        style={{ background: flow.color + "22", color: flow.color }}>
                        {node.type === "dead" ? "Tidak" : "Ya"}
                      </div>
                    )}

                    <div className="relative">
                      <FlowNode
                        node={node}
                        color={flow.color}
                        isActive={isActive}
                        onClick={(n) => setActiveNode(isActive ? null : n)}
                      />
                    </div>

                    {showArrow && (
                      <div className="flex flex-col items-center my-1">
                        <div className="w-px h-6" style={{ background: flow.color + "44" }} />
                        <div className="w-0 h-0" style={{
                          borderLeft: "5px solid transparent",
                          borderRight: "5px solid transparent",
                          borderTop: `6px solid ${flow.color}88`,
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active node detail panel (Mobile friendly) */}
          {activeNode && (
            <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-black/8 p-4 md:min-w-[300px] md:max-w-md"
              style={{ borderTop: `4px solid ${flow.color}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-[#1C1917] text-[15px]">{activeNode.label}</div>
                  {activeNode.sub && <div className="text-xs text-[#78716C] mt-1">{activeNode.sub}</div>}
                </div>
                <button onClick={() => setActiveNode(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-[#A8A29E] hover:text-[#1C1917] hover:bg-gray-200 text-lg transition-colors">×</button>
              </div>
              {activeNode.checks ? (
                <div className="space-y-2 mt-4 bg-gray-50 p-3 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: flow.color }}>
                    Dev Checkpoints
                  </div>
                  {activeNode.checks.map((c: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#1C1917] leading-snug">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0 mt-0.5"
                        style={{ background: flow.color }}>✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#A8A29E] mt-2 italic">Tidak ada checkpoint spesifik.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TASKS VIEW */}
      {activeView === "tasks" && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Overall progress */}
          <div className="bg-[#1C1917] rounded-2xl p-4 mb-8 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-300">Sprint Progress</span>
              <span className="text-lg font-black text-amber-400">{Math.round((totalDone/totalTasks)*100)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(totalDone / totalTasks) * 100}%`, background: "linear-gradient(90deg, #F59E0B, #D97706)" }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right">{totalDone} of {totalTasks} tasks completed</div>
          </div>

          {/* Phase selector */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
            {PHASES.map(p => {
              const pct = getProgress(p);
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id)}
                  className="flex-shrink-0 px-4 py-3 rounded-xl text-left transition-all relative overflow-hidden min-w-[140px]"
                  style={{
                    background: activePhase === p.id ? p.color : "#fff",
                    color: activePhase === p.id ? "#fff" : "#1C1917",
                    border: activePhase === p.id ? "none" : "1px solid #E5E7EB",
                    boxShadow: activePhase === p.id ? `0 4px 12px ${p.color}40` : "none"
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{p.label}</div>
                    <div className="text-sm font-bold mt-0.5">{p.title}</div>
                  </div>
                  {pct > 0 && (
                    <div className="absolute bottom-0 left-0 h-1.5"
                      style={{ width: `${pct}%`, background: activePhase === p.id ? "rgba(255,255,255,0.3)" : p.color }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active phase tasks */}
          {PHASES.filter(p => p.id === activePhase).map(phase => (
            <div key={phase.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="font-black text-[#1C1917] text-xl">{phase.title}</h2>
                  <div className="text-sm text-[#A8A29E] font-medium">{phase.timeline}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm">
                {phase.tasks.map((task, i) => (
                  <div key={task.id} className={i < phase.tasks.length - 1 ? "border-b border-gray-100" : ""}>
                    <TaskCard
                      task={{ ...task, done: tasks[task.id] }}
                      color={phase.color}
                      onToggle={toggleTask}
                    />
                  </div>
                ))}
              </div>

              {/* Phase specific hints */}
              {phase.id === "p0" && (
                <div className="mt-4 p-3.5 rounded-xl text-sm flex gap-3"
                  style={{ background: "#FEF2F2", border: `1px solid #FECACA`, color: "#991B1B" }}>
                  <span>🚨</span>
                  <div>Jangan pindah ke Phase 1 sebelum <strong>semua credentials dirotasi</strong> dan Image Compression diaktifkan.</div>
                </div>
              )}
              {phase.id === "p1" && (
                <div className="mt-4 p-3.5 rounded-xl text-sm flex gap-3"
                  style={{ background: "#FFFBEB", border: `1px solid #FDE68A`, color: "#92400E" }}>
                  <span>⭐</span>
                  <div><strong>Focus:</strong> Hilangkan segala friksi dari pendaftaran sampai katalog pertama bisa di-share.</div>
                </div>
              )}
              {phase.id === "p2" && (
                <div className="mt-4 p-3.5 rounded-xl text-sm flex gap-3"
                  style={{ background: "#ECFDF5", border: `1px solid #A7F3D0`, color: "#065F46" }}>
                  <span>📈</span>
                  <div><strong>North Star Metric:</strong> Fokus pada "Berapa banyak toko yang mendapatkan order WA nyata dalam minggu ini."</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}