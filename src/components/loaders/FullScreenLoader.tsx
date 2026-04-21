import { useEffect, useState } from 'react';
import { LocateFixed } from 'lucide-react';

export default function FullScreenLoader() {
    const messages = [
        'Fetching live locations...',
        'Syncing telemetry...',
        'Checking alerts...',
        'Establishing CORS connectivity...',
        'Loading rover assets...',
    ];

    const [msgIndex, setMsgIndex] = useState(0);
    const [showRetry, setShowRetry] = useState(false);

    useEffect(() => {
        const textInterval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 1000);

        const timeout = setTimeout(() => {
            setShowRetry(true);
        }, 5000);

        return () => {
            clearInterval(textInterval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500"
            style={{ backgroundColor: 'var(--void)' }}
            aria-live="polite"
        >
            <div className="relative mb-6 flex items-center justify-center">
                {/* Radar pulsing ring */}
                <div className="absolute w-24 h-24 rounded-full border-2 border-primary-cyan animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" />
                <div className="absolute w-16 h-16 rounded-full border-2 border-primary-cyan animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" style={{ animationDelay: '0.4s' }} />
                {/* GPS Icon */}
                <LocateFixed className="w-12 h-12 relative z-10" style={{ color: 'var(--primary-cyan)' }} />
            </div>

            <div className="h-6 flex items-center justify-center overflow-hidden">
                <p className="font-mono-data text-sm tracking-widest uppercase transition-all animate-pulse" style={{ color: 'var(--text-secondary)' }}>
                    {messages[msgIndex]}
                </p>
            </div>

            {/* Fallback Retry Button */}
            {showRetry && (
                <div className="mt-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <p className="font-mono-data text-xs mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
                        Taking longer than expected?
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 font-mono-data text-xs uppercase tracking-wider card-surface hover:bg-surface-hover transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Force Reload
                    </button>
                </div>
            )}
        </div>
    );
}
