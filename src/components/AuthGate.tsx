import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Lock, Crosshair } from 'lucide-react';
import ButtonSpinner from '@/components/loaders/ButtonSpinner';
import { useNavigate } from 'react-router-dom';
import { allRovers } from '@/data/rovers';
import partnerLogo from '@/assest/partner.png';

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, userRole, login, selectRover, showModal, setShowModal } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn && userRole) {
            setShowModal(false);
        }
    }, [isLoggedIn, userRole, setShowModal]);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'system' | 'admin'>('system');

    const [roverInput, setRoverInput] = useState('');
    const [rErr, setRErr] = useState('');

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setErr('Invalid credentials. Hint: use admin / admin');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const success = login(username, password);
            if (success) {
                // If it's one of the admin levels, close modal immediately
                if (username.toLowerCase().includes('admin') && username.toLowerCase() !== 'admin') {
                    setShowModal(false);
                    navigate('/');
                }
            }
            setLoading(false);
        }, 800);
    };

    const handleRoverSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!roverInput.trim()) {
            setRErr('Rover ID is required.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            selectRover(roverInput.trim().toUpperCase());
            setLoading(false);
            setShowModal(false);
            navigate('/workspace');
        }, 600);
    };

    return (
        <>
            <div className="w-full relative">
                {children}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    {/* Close Background Hitbox */}
                    <div className="absolute inset-0 z-0" onClick={() => setShowModal(false)} />

                    <div className="relative z-10 w-full max-w-sm">
                        {!isLoggedIn ? (
                            /* Login Modal */
                            <div className="w-full card-surface p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
                                <div className="mb-8 w-full flex justify-center">
                                    <img src={partnerLogo} alt="Partners" className="h-12 w-auto object-contain max-w-[280px]" />
                                </div>
                                <div className="flex w-full mb-8 bg-[var(--void)] p-1 rounded border border-[var(--border-color)]">
                                    <button
                                        onClick={() => setMode('system')}
                                        className={`flex-1 py-2 text-[10px] font-mono-data font-bold rounded transition-all ${
                                            mode === 'system' ? 'bg-[var(--primary-cyan)] text-white' : 'text-[var(--text-muted)]'
                                        }`}
                                    >
                                        SYSTEM ACCESS
                                    </button>
                                    <button
                                        onClick={() => setMode('admin')}
                                        className={`flex-1 py-2 text-[10px] font-mono-data font-bold rounded transition-all ${
                                            mode === 'admin' ? 'bg-[var(--danger)] text-white' : 'text-[var(--text-muted)]'
                                        }`}
                                    >
                                        ADMIN LOGIN
                                    </button>
                                </div>

                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: mode === 'system' ? 'var(--primary-cyan-dim)' : 'var(--danger-dim)' }}>
                                    <Lock className="w-8 h-8" style={{ color: mode === 'system' ? 'var(--primary-cyan)' : 'var(--danger)' }} />
                                </div>
                                <h2 className="font-display text-2xl font-semibold mb-2 text-[var(--text-primary)]">
                                    {mode === 'system' ? 'System Access' : 'Admin Login'}
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)] text-center mb-8 font-mono-data tracking-wide uppercase">
                                    {mode === 'system' ? 'Authentication Required' : 'Master Credentials Required'}
                                </p>

                                <form onSubmit={handleLogin} className="w-full space-y-4">
                                    {mode === 'admin' && (
                                        <div className="flex gap-2 mb-4">
                                            {(['L1', 'L2', 'L3'] as const).map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() => {
                                                        setUsername(`${lvl}admin`);
                                                        setPassword(`${lvl}admin`);
                                                    }}
                                                    className="flex-1 py-2 text-[10px] font-mono-data font-bold rounded border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all"
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-[var(--void)] border border-[var(--border-color)] px-4 py-3 rounded text-[var(--text-primary)] text-sm font-mono-data focus:outline-none focus:border-[var(--primary-cyan)] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[var(--void)] border border-[var(--border-color)] px-4 py-3 rounded text-[var(--text-primary)] text-sm font-mono-data focus:outline-none focus:border-[var(--primary-cyan)] transition-colors"
                                        />
                                    </div>
                                    {err && <p className="text-xs text-[var(--danger)] font-mono-data">{err}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 mt-4 flex items-center justify-center gap-2 rounded text-white font-mono-data font-bold tracking-wider transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: mode === 'system' ? 'var(--primary-cyan)' : 'var(--danger)' }}
                                    >
                                        {loading && <ButtonSpinner size="h-4 w-4" color="text-white" />}
                                        {loading ? 'AUTHENTICATING...' : mode === 'system' ? 'LOGIN' : 'AUTHORIZE'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* Rover Selection Modal */
                            <div className="w-full card-surface p-8 shadow-2xl relative overflow-hidden flex flex-col items-center animate-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 rounded-full bg-[var(--success)]/20 flex items-center justify-center mb-6">
                                    <Crosshair className="w-8 h-8 text-[var(--success)]" />
                                </div>
                                <h2 className="font-display text-2xl font-semibold mb-2 text-[var(--text-primary)]">Select Rover</h2>
                                <p className="text-sm text-[var(--text-secondary)] text-center mb-8 font-mono-data tracking-wide uppercase">
                                    Assign Working Node
                                </p>

                                <form onSubmit={handleRoverSubmit} className="w-full space-y-4">
                                    <div>
                                        <select
                                            value={roverInput}
                                            onChange={(e) => setRoverInput(e.target.value)}
                                            className="w-full bg-[var(--void)] border border-[var(--border-color)] px-4 py-3 rounded text-[var(--text-primary)] text-sm font-mono-data focus:outline-none focus:border-[var(--success)] transition-colors uppercase custom-scrollbar"
                                        >
                                            <option value="">-- SELECT EXISTING ROVER --</option>
                                            {allRovers.slice(0, 150).map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {r.id}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {rErr && <p className="text-xs text-[var(--danger)] font-mono-data">{rErr}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 mt-4 flex items-center justify-center gap-2 rounded bg-[var(--success)] text-white font-mono-data font-bold tracking-wider hover:bg-[var(--success)]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading && <ButtonSpinner size="h-4 w-4" color="text-white" />}
                                        {loading ? 'SYNCING...' : 'START WORK'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
