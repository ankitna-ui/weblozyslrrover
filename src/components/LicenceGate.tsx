import { useState, useRef, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import partnerLogo from '@/assest/partner.png';

interface LicenceGateProps {
  onValidate: (key: string) => boolean;
  error: string;
  isLocked: boolean;
  attempts: number;
}

export default function LicenceGate({ onValidate, error, isLocked, attempts }: LicenceGateProps) {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (error && attempts > 0) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [error, attempts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidate(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(11, 12, 16, 0.95)' }}>
      <div
        ref={cardRef}
        className="w-full max-w-[400px] card-surface p-8"
        style={{
          transform: shake ? 'translateX(-8px)' : undefined,
          transition: shake ? 'transform 0.1s ease' : undefined,
        }}
      >
        <div className="flex justify-center mb-6">
          <img src={partnerLogo} alt="Partners Logo" className="h-14 w-auto object-contain max-w-[280px]" />
        </div>

        <div className="flex justify-center mb-6">
          <Lock className="w-12 h-12" style={{ color: 'var(--primary-cyan)' }} />
        </div>

        <h3 className="font-display font-semibold text-lg text-center mb-2"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          LICENCE VALIDATION REQUIRED
        </h3>

        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enter PTS Licence Key to access the monitoring dashboard
        </p>

        {isLocked && (
          <div className="flex items-center gap-2 p-3 mb-4 card-surface"
            style={{ borderColor: 'var(--danger)' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />
            <span className="text-xs" style={{ color: 'var(--danger)' }}>
              Access Denied. Contact system administrator.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="PTS-XXXX-XX-XX"
            disabled={isLocked}
            className="w-full h-11 px-3 mb-4 font-mono-data text-xs tracking-wider"
            style={{
              backgroundColor: 'var(--void)',
              border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = 'var(--primary-cyan)';
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = 'var(--border-color)';
            }}
          />

          {error && !isLocked && (
            <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLocked || !input.trim()}
            className="w-full h-11 font-display font-medium text-sm uppercase tracking-wider"
            style={{
              backgroundColor: !input.trim() || isLocked ? 'var(--primary-dim)' : 'var(--primary-cyan)',
              color: 'var(--void)',
              opacity: !input.trim() || isLocked ? 0.4 : 1,
              cursor: !input.trim() || isLocked ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLocked) {
                e.currentTarget.style.backgroundColor = 'var(--primary-dim)';
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim() && !isLocked) {
                e.currentTarget.style.backgroundColor = 'var(--primary-cyan)';
              }
            }}
          >
            ACCESS DASHBOARD
          </button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Try: PTS-MASTER-00
        </p>
      </div>
    </div>
  );
}
