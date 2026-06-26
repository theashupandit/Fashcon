'use client';

import React from 'react';

export default function LogoutAnimationScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0b] z-[99999] overflow-hidden select-none animate-in fade-in duration-300">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fc-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fc-spin-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes fc-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes fc-pulse-ring-delay {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes fc-logo-breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.06); filter: brightness(1.2); }
        }
        @keyframes fc-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes fc-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fc-letter-reveal {
          from { opacity: 0; transform: translateY(8px) scale(0.9); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes fc-dot-pulse {
          0%, 80%, 100% { opacity: 0.15; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes fc-particle-float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          50% { transform: translateY(-80px) translateX(20px); }
        }
        @keyframes fc-glow-orbit {
          0% { transform: rotate(0deg) translateX(70px) rotate(0deg); opacity: 0.5; }
          50% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); opacity: 0.5; }
        }
      `}</style>

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(255,45,100,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 2 === 0 ? '3px' : '2px',
          height: i % 2 === 0 ? '3px' : '2px',
          borderRadius: '50%',
          background: i % 3 === 0 ? 'rgba(255,45,100,0.5)' : 'rgba(255,255,255,0.2)',
          left: `${20 + i * 12}%`,
          top: `${30 + (i % 3) * 15}%`,
          animation: `fc-particle-float ${5 + i * 1.5}s ease-in-out ${i * 0.8}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Main loader assembly */}
      <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Outer pulse rings */}
        <div style={{
          position: 'absolute', inset: '-10px', borderRadius: '50%',
          border: '1px solid rgba(255,45,100,0.15)',
          animation: 'fc-pulse-ring 3s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '-10px', borderRadius: '50%',
          border: '1px solid rgba(255,45,100,0.08)',
          animation: 'fc-pulse-ring-delay 3s ease-in-out 0.8s infinite',
        }} />

        {/* Outer spinning ring (dashed) */}
        <div style={{
          position: 'absolute', inset: '0', borderRadius: '50%',
          border: '1.5px dashed rgba(255,255,255,0.06)',
          animation: 'fc-spin 20s linear infinite',
        }} />

        {/* Primary arc ring */}
        <div style={{
          position: 'absolute', inset: '12px', borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#ff2d64',
          borderRightColor: 'rgba(255,45,100,0.3)',
          animation: 'fc-spin 1.4s cubic-bezier(0.68, -0.15, 0.27, 1.15) infinite',
          filter: 'drop-shadow(0 0 8px rgba(255,45,100,0.4))',
        }} />

        {/* Secondary arc ring (counter) */}
        <div style={{
          position: 'absolute', inset: '24px', borderRadius: '50%',
          border: '1.5px solid transparent',
          borderBottomColor: 'rgba(255,255,255,0.15)',
          borderLeftColor: 'rgba(255,255,255,0.05)',
          animation: 'fc-spin-reverse 2s linear infinite',
        }} />

        {/* Inner subtle ring */}
        <div style={{
          position: 'absolute', inset: '34px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.04)',
        }} />

        {/* Orbiting dot */}
        <div style={{
          position: 'absolute', inset: '0',
          animation: 'fc-spin 3s linear infinite',
        }}>
          <div style={{
            position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)',
            width: '4px', height: '4px', borderRadius: '50%',
            background: '#ff2d64',
            boxShadow: '0 0 12px 3px rgba(255,45,100,0.6)',
          }} />
        </div>

        {/* Logo center */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,45,100,0.12) 0%, rgba(20,20,22,0.9) 100%)',
          border: '1px solid rgba(255,45,100,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fc-logo-breathe 3s ease-in-out infinite',
          boxShadow: '0 0 30px rgba(255,45,100,0.15), inset 0 0 20px rgba(0,0,0,0.5)',
          position: 'relative', zIndex: 2,
        }}>
          <img
            src="/Admin favicon_io/android-chrome-192x192.png"
            alt="Fashcon"
            width={30}
            height={30}
            className="rounded-full"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,45,100,0.3))' }}
          />
        </div>
      </div>

      {/* Brand text with staggered letter reveal */}
      <div style={{
        marginTop: '36px',
        display: 'flex', gap: '5px', alignItems: 'center',
        animation: 'fc-fade-up 0.8s ease-out 0.3s both',
      }}>
        {'FASHCON'.split('').map((letter, i) => (
          <span key={i} style={{
            fontSize: '16px', fontWeight: 900, letterSpacing: '0.35em',
            color: i === 0 || i === 4 ? '#ff2d64' : 'rgba(255,255,255,0.7)',
            animation: `fc-letter-reveal 0.5s ease-out ${0.5 + i * 0.08}s both`,
            display: 'inline-block',
          }}>
            {letter}
          </span>
        ))}
      </div>

      {/* Subtitle */}
      <p style={{
        marginTop: '10px',
        fontSize: '9px', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.4em',
        color: 'rgba(255,255,255,0.2)',
        animation: 'fc-fade-up 0.8s ease-out 1.2s both',
      }}>
        Securing Console
      </p>

      {/* Progress bar */}
      <div style={{
        marginTop: '32px',
        width: '180px', height: '2px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px', overflow: 'hidden',
        animation: 'fc-fade-up 0.8s ease-out 1.5s both',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, #ff2d64 50%, transparent 100%)',
          animation: 'fc-shimmer 1.8s ease-in-out infinite',
          width: '40%',
        }} />
      </div>

      {/* Loading dots */}
      <div style={{
        marginTop: '20px', display: 'flex', gap: '6px',
        animation: 'fc-fade-up 0.8s ease-out 1.8s both',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: '#ff2d64',
            animation: `fc-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
