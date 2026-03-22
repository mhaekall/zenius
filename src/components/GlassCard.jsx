import React from 'react';

/**
 * GlassCard - Apple HIG Inspired Component
 * Menggunakan utility backdrop-blur dari TailwindCSS terbaru 
 * untuk menghasilkan efek glassmorphism yang mulus (seamless).
 */
export default function GlassCard({ title, description, children }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl transition-all duration-300 ease-out hover:bg-white/20 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:border-white/10 dark:bg-black/20">
      {/* Glossy Reflection Highlight */}
      <div className="absolute -left-1/2 -top-1/2 h-full w-full rotate-45 bg-gradient-to-br from-white/20 to-transparent opacity-30 pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="mb-2 text-2xl font-semibold tracking-tight text-slate-800 dark:text-white">
          {title}
        </h3>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
        
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
