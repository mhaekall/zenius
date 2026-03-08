export function PoweredBy() {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A8A29E]/60">Powered By</span>
      <div className="flex items-center gap-1 opacity-60">
        <div className="w-3 h-3 bg-gradient-to-br from-[#F59E0B] to-amber-600 rounded-[3px] flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[11px] font-bold text-[#A8A29E] tracking-tight">OpenMenu</span>
      </div>
    </div>
  );
}