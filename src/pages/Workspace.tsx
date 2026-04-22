import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Cpu, Shield, Activity, HardDrive, Wifi, Crosshair, LayoutDashboard, User, Lock, Mail, Phone, Settings, Save, MapPin, Navigation, Power, RotateCcw, AlertTriangle, FileText } from 'lucide-react';
import UtilizationBar from '@/components/UtilizationBar';
import { allRovers } from '@/data/rovers';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// -------------------------------
// Live Telemetry Feed (Dummy)
// -------------------------------
function LiveTerminal({ roverId }: { roverId: string }) {
    const [lines, setLines] = useState<{ text: string, error: boolean }[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const dummyLogs = [
            'Establishing secure socket...',
            'Handshake authenticated via 1024-bit RSA.',
            'Receiving NMEA $GPGGA strings.',
            'Vector checksum validated: OK.',
            'Syncing altimeter with ground pressure...',
            'Kalman filter stabilizing.',
            'Baud rate negotiated: 115200.',
            'Buffer overflow threshold normal.',
            'Incoming packet loss: 0.05%.',
            'Applying differential corrections.',
            'Kinematic base link active.',
            'Resolving integer ambiguities...',
            'Float -> Fixed RTK solution.',
            'Heartbeat ACK received.',
            'Refreshing constellation ephemeris...'
        ];

        let timeoutId: ReturnType<typeof setTimeout>;
        let isMounted = true;

        const pushLog = () => {
            if (!isMounted) return;
            const time = new Date().toLocaleTimeString();
            const logMsg = dummyLogs[Math.floor(Math.random() * dummyLogs.length)];
            const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();

            // Randomly simulate a warning/error
            const isError = Math.random() > 0.9;
            const logContent = `[${time}] <${roverId}> 0x${hex} -> ${isError ? 'WARN: Packet Drop Detected!' : logMsg}`;

            setLines(prev => {
                const updated = [...prev, { text: logContent, error: isError }];
                return updated.slice(-30);
            });

            timeoutId = setTimeout(pushLog, Math.random() * 1200 + 400);
        };

        pushLog();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [roverId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    return (
        <div className="bg-[#111827] border border-[var(--border-color)] p-4 rounded overflow-y-auto custom-scrollbar h-full w-full min-h-[400px] flex flex-col font-mono-data text-[10px] leading-relaxed relative text-left">
            <div className="absolute top-2 right-2 bg-[var(--void)] text-[var(--success)] px-2 py-0.5 border border-[var(--success)]/30 rounded animate-pulse text-[10px]">LIVE WSS STREAM</div>
            <div className="mt-6 flex-1">
                {lines.map((line, idx) => (
                    <div key={idx} className={line.error ? "text-[var(--warning)]" : "text-[var(--primary-cyan)] opacity-90"}>
                        {line.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

// Main Component
// -------------------------------
export default function Workspace() {
    const { isLoggedIn, roverId, setShowModal } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'settings'>('overview');

    // Fetch Exact Rover early for hook dependencies
    const exactRover = allRovers.find(r => r.id === roverId);
    const operatorName = exactRover?.surveyorName || 'Admin Operator';
    const operatorID = exactRover?.ptsLicence || 'PTS-OP-992';

    // Profile States derived dynamically
    const [profile, setProfile] = useState(() => ({
        email: `${operatorName.replace(/\s+/g, '.').toLowerCase()}@telangana-pt-nodes.gov`,
        phone: '+91 9' + Math.floor(Math.random() * 90000000 + 10000000).toString(),
        clearance: 'LEVEL 4 OMEGA',
        password: '*************'
    }));

    const [saved, setSaved] = useState(false);

    // ==========================================
    // LOCAL STORAGE EXTRA FEATURES
    // ==========================================
    const [missionNotes, setMissionNotes] = useState(() => {
        if (!roverId) return '';
        return localStorage.getItem(`__rvr_notes_${roverId}`) || '';
    });

    const [commandHistory, setCommandHistory] = useState<{ time: string, cmd: string }[]>(() => {
        if (!roverId) return [];
        const savedLog = localStorage.getItem(`__rvr_cmd_hist_${roverId}`);
        return savedLog ? JSON.parse(savedLog) : [];
    });

    // Auto-save mechanisms for LocalStorage
    useEffect(() => {
        if (roverId) {
            localStorage.setItem(`__rvr_notes_${roverId}`, missionNotes);
        }
    }, [missionNotes, roverId]);

    useEffect(() => {
        if (roverId) {
            localStorage.setItem(`__rvr_cmd_hist_${roverId}`, JSON.stringify(commandHistory));
        }
    }, [commandHistory, roverId]);
    // ==========================================

    // Sync profile when rover changes
    useEffect(() => {
        if (exactRover) {
            setProfile(p => ({
                ...p,
                email: `${exactRover.surveyorName.replace(/\s+/g, '.').toLowerCase()}@telangana-pt-nodes.gov`
            }));
            // Update local storage states for new rover
            setMissionNotes(localStorage.getItem(`__rvr_notes_${exactRover.id}`) || '');
            const savedLog = localStorage.getItem(`__rvr_cmd_hist_${exactRover.id}`);
            setCommandHistory(savedLog ? JSON.parse(savedLog) : []);
        }
    }, [exactRover?.id]);

    useEffect(() => {
        if (!isLoggedIn || !roverId) {
            setShowModal(true);
            navigate('/');
        }
    }, [isLoggedIn, roverId, navigate, setShowModal]);

    if (!isLoggedIn || !roverId) return null;

    // Login Timestamp parsing
    const loginTimeRaw = localStorage.getItem('__rvr_login_time');
    let formattedTime = 'Unknown';
    let formattedDate = 'Unknown';
    if (loginTimeRaw) {
        const d = new Date(loginTimeRaw);
        formattedDate = d.toLocaleDateString();
        formattedTime = d.toLocaleTimeString();
    }

    // Exact Rover Metrics
    const batteryStr = exactRover ? `${exactRover.battery}%` : '88%';
    const accuracyStr = exactRover ? `${exactRover.accuracy}m` : '0.02m';
    const signalStr = exactRover ? `-64dBm` : '-64dBm';
    const statusStr = exactRover ? (exactRover.status === 'online' ? 'NODE SYNCED' : 'OFFLINE') : 'NODE SYNCED';
    const svStr = exactRover ? `${exactRover.satellites} SV` : '32 SV';

    // Map Position Logic
    const position = exactRover ? [exactRover.lat, exactRover.lng] as [number, number] : [17.3850, 78.4867] as [number, number];

    const roverIcon = new L.DivIcon({
        className: 'custom-rover-pin',
        html: `<div style="width:16px;height:16px;background:var(--primary-cyan);border-radius:50%;border:3px solid var(--void);box-shadow:0 0 12px var(--primary-cyan)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        toast.success(`Profile settings for ${operatorName} successfully synced.`);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleRoverAction = (actionType: string) => {
        // Push to localStorage tracking Array
        const newEvent = { time: new Date().toLocaleTimeString(), cmd: actionType.toUpperCase() };
        setCommandHistory(prev => [newEvent, ...prev].slice(0, 15)); // Keep last 15 commands

        switch (actionType) {
            case 'reboot':
                toast('Command Transmitted', { description: `Initiating hardware spin-down for ${roverId}` });
                break;
            case 'firmware':
                toast.success('Firmware Check', { description: `${roverId} is running the latest kernel.` });
                break;
            case 'halt':
                toast.error('EMERGENCY HALT', { description: `All kinematics suspended on ${roverId}` });
                break;
        }
    };

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: 'var(--void)', paddingTop: '48px', paddingBottom: '32px' }}>
            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 pt-6">

                {/* Workspace Header w/ Tabs */}
                <div className="mb-8 border-b pb-1" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--primary-cyan)' }} />
                                <h1 className="font-mono-data text-xs uppercase tracking-wider" style={{ color: 'var(--primary-cyan)' }}>
                                    PERSONAL WORKSPACE
                                </h1>
                            </div>
                            <h2 className="font-display font-semibold mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                OPERATOR UI
                            </h2>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Welcome back, {operatorName}. <span className="font-mono-data text-[var(--success)] ml-2">ACCESS GRANTED</span>
                            </p>
                        </div>
                        <div className="flex bg-[var(--surface)] border border-[var(--border-color)] rounded overflow-hidden">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-5 py-2.5 font-mono-data text-xs transition-colors border-r border-[var(--border-color)] ${activeTab === 'overview' ? 'bg-[var(--primary-cyan)]/20 text-[var(--primary-cyan)]' : 'text-[var(--text-muted)] hover:bg-[var(--void)]'}`}>
                                ACTIVE FEED
                            </button>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`px-5 py-2.5 font-mono-data text-xs transition-colors border-r border-[var(--border-color)] flex items-center gap-2 ${activeTab === 'logs' ? 'bg-[var(--primary-cyan)]/20 text-[var(--primary-cyan)]' : 'text-[var(--text-muted)] hover:bg-[var(--void)]'}`}>
                                <FileText className="w-3.5 h-3.5" /> SYSTEM LOGS
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-5 py-2.5 font-mono-data text-xs transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[var(--primary-cyan)]/20 text-[var(--primary-cyan)]' : 'text-[var(--text-muted)] hover:bg-[var(--void)]'}`}>
                                <Settings className="w-3.5 h-3.5" /> PROFILE SETTINGS
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Info Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* User Profile Overview */}
                            <div className="card-surface p-6 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Shield className="w-48 h-48" />
                                </div>
                                <div>
                                    <div className="w-12 h-12 rounded bg-[var(--primary-cyan)]/20 flex items-center justify-center mb-4 relative z-10 border border-[var(--primary-cyan)]/30">
                                        <User className="w-6 h-6 text-[var(--primary-cyan)]" />
                                    </div>
                                    <h3 className="font-display font-semibold text-xl mb-1 text-[var(--text-primary)]">{operatorName}</h3>
                                    <p className="font-mono-data text-xs text-[var(--text-secondary)] mb-6 tracking-wide">LICENCE: {operatorID}</p>

                                    <div className="space-y-4 font-mono-data text-xs mb-8">
                                        <div className="flex justify-between items-center bg-[var(--void)] p-2 rounded border border-[var(--border-color)]">
                                            <span className="text-[var(--text-muted)] flex items-center gap-1.5"><Shield className="w-3 h-3" /> CLEARANCE</span>
                                            <span className="text-[var(--text-primary)] font-bold">{profile.clearance}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-[var(--void)]/50 rounded border border-[var(--border-color)] font-mono-data text-xs mb-4">
                                    <span className="text-[var(--text-muted)] block mb-2">- AUTHORIZATION TIMESTAMP -</span>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[var(--text-primary)] text-sm">{formattedDate}</span>
                                        <span className="text-[var(--primary-cyan)] text-lg">{formattedTime}</span>
                                    </div>
                                </div>

                                {/* Quick Management Controls */}
                                <div className="border border-[var(--border-color)] rounded p-4 relative z-10 bg-[var(--void)]/80">
                                    <h4 className="font-mono-data text-xs text-[var(--text-muted)] mb-3 flex items-center gap-2 tracking-wide">
                                        <Settings className="w-3.5 h-3.5" /> ROVER MANAGEMENT
                                    </h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRoverAction('reboot')} title="Reboot Node" className="flex-1 bg-[var(--surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] p-2 rounded transition-colors flex justify-center text-[var(--text-secondary)] hover:text-[var(--primary-cyan)]">
                                            <Power className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleRoverAction('firmware')} title="Check Firmware" className="flex-1 bg-[var(--surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] p-2 rounded transition-colors flex justify-center text-[var(--text-secondary)] hover:text-[var(--primary-cyan)]">
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleRoverAction('halt')} title="Emergency Halt" className="flex-1 bg-[var(--danger)]/20 hover:bg-[var(--danger)] border border-[var(--danger)]/50 p-2 rounded transition-colors flex justify-center text-[var(--danger)] hover:text-white">
                                            <AlertTriangle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 3D Visualizer & Rover Metrics */}
                            <div className="card-surface p-6 relative overflow-hidden lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-8">
                                    {/* Left: Metadata */}
                                    <div className="flex flex-col justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 rounded bg-[var(--success)]/20 flex items-center justify-center border border-[var(--success)]/30">
                                                    <Crosshair className="w-6 h-6 text-[var(--success)]" />
                                                </div>
                                                <span className="font-mono-data text-xs px-3 py-1.5 rounded items-center gap-2 border inline-flex tracking-wider"
                                                    style={{ backgroundColor: 'var(--void)', borderColor: exactRover?.status === 'online' ? 'var(--success)' : 'var(--danger)', color: exactRover?.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>
                                                    <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${exactRover?.status === 'online' ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                                                    {statusStr}
                                                </span>
                                            </div>
                                            <h3 className="font-display font-semibold text-3xl mb-1 text-[var(--text-primary)]">{roverId}</h3>
                                            <p className="font-mono-data text-xs text-[var(--text-secondary)] mb-6">FIRMWARE: V2.4.1.99 | UPTIME: 841h</p>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center gap-3">
                                                    <Navigation className="w-4 h-4 text-[var(--text-muted)]" />
                                                    <div className="flex-1 font-mono-data text-xs text-[var(--text-primary)]">DEVICE: {exactRover?.deviceName || 'GX-AERO'}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                                                    <div className="flex-1 font-mono-data text-xs text-[var(--text-primary)]">SPEED: {exactRover?.speed || 0} km/h</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Activity className="w-4 h-4 text-[var(--text-muted)]" />
                                                    <div className="flex-1 font-mono-data text-xs text-[var(--text-primary)]">FILE LOGS: {exactRover?.pointsCollected || 0} RTK points</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 font-mono-data text-sm bg-[var(--void)] p-4 rounded border border-[var(--border-color)]">
                                            <div>
                                                <span className="text-[var(--text-muted)] text-[10px] block mb-1 tracking-wider uppercase">Battery Drop</span>
                                                <span className="text-[var(--text-primary)] text-xl block">{batteryStr}</span>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-muted)] text-[10px] block mb-1 tracking-wider uppercase">Signal Volts</span>
                                                <span className="text-[var(--primary-cyan)] text-xl block">{signalStr}</span>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-muted)] text-[10px] block mb-1 tracking-wider uppercase">GPS Precision</span>
                                                <span className="text-[var(--text-primary)] text-xl block">{accuracyStr}</span>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-muted)] text-[10px] block mb-1 tracking-wider uppercase">GLONASS Orbits</span>
                                                <span className="text-[var(--text-primary)] text-xl block">{svStr}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: GPS Location Map */}
                                    <div className="relative border border-[var(--border-color)]/50 rounded flex flex-col bg-[var(--void)]/50 overflow-hidden min-h-[300px]">
                                        <div className="absolute top-4 left-4 z-[400] flex gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]"></span>
                                        </div>
                                        <p className="absolute bottom-4 left-4 font-mono-data text-[10px] text-[var(--primary-cyan)] tracking-[0.2em] z-[400] px-2 py-1 bg-[var(--void)]/80 rounded border border-[var(--primary-cyan)]/30 backdrop-blur-sm">LIVE TELEMETRY MAP</p>

                                        <MapContainer
                                            center={position}
                                            zoom={14}
                                            zoomControl={false}
                                            style={{ height: '100%', width: '100%', minHeight: '300px' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                            />
                                            <Marker position={position} icon={roverIcon}>
                                                <Popup className="rover-popup border border-[var(--primary-cyan)] bg-[var(--void)] text-[var(--text-primary)]">
                                                    <div className="font-mono-data text-xs">
                                                        <strong className="text-[var(--primary-cyan)] pb-1 border-b border-[var(--border-color)] block mb-1">{roverId}</strong>
                                                        LAT: {position[0].toFixed(5)}<br />
                                                        LNG: {position[1].toFixed(5)}<br />
                                                        <span className="text-[var(--success)]">SYNCED</span>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                            <Circle center={position} radius={exactRover?.accuracy || 5} pathOptions={{ color: 'var(--primary-cyan)', fillColor: 'var(--primary-cyan)', fillOpacity: 0.2 }} />
                                            <Circle center={position} radius={500} pathOptions={{ color: 'var(--success)', fillColor: 'var(--success)', fillOpacity: 0.05, weight: 1, dashArray: '4' }} />
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Node Performance Bottom */}
                        <div className="card-surface p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-4 h-4 text-[var(--text-primary)]" />
                                <h3 className="font-display font-semibold text-sm uppercase text-[var(--text-primary)] tracking-widest">Secondary Node Flow</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <div className="flex justify-between items-center mb-2 font-mono-data text-xs">
                                        <span className="text-[var(--text-muted)] flex items-center gap-2 tracking-wider"><HardDrive className="w-3 h-3" /> NVR STORAGE</span>
                                        <span className="text-[var(--text-primary)]">42%</span>
                                    </div>
                                    <UtilizationBar percentage={42} width={100} />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2 font-mono-data text-xs">
                                        <span className="text-[var(--text-muted)] flex items-center gap-2 tracking-wider"><Cpu className="w-3 h-3" /> CHIPSET LOAD</span>
                                        <span className="text-[var(--success)]">18%</span>
                                    </div>
                                    <UtilizationBar percentage={18} width={100} />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2 font-mono-data text-xs">
                                        <span className="text-[var(--text-muted)] flex items-center gap-2 tracking-wider"><Wifi className="w-3 h-3" /> UPLINK BANDWIDTH</span>
                                        <span className="text-[var(--text-primary)]">1.2 MB/s</span>
                                    </div>
                                    <UtilizationBar percentage={75} width={100} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* LOCAL STORAGE SYSTEM LOGS TAB */}
                {/* ============================================================== */}
                {activeTab === 'logs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Mission Notes LocalStorage Notepad */}
                            <div className="card-surface p-6 flex flex-col h-full border-t-4" style={{ borderTopColor: 'var(--primary-cyan)' }}>
                                <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4">
                                    <div>
                                        <h3 className="font-display font-semibold text-[var(--text-primary)] text-xl flex items-center gap-2">
                                            <HardDrive className="w-5 h-5 text-[var(--primary-cyan)]" /> OPERATOR LOGBOOK
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)] font-mono-data mt-1">Locally encrypted for {operatorName}</p>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full flex-1 bg-[var(--void)] border border-[var(--border-color)] p-4 rounded text-sm text-[var(--text-primary)] font-mono-data custom-scrollbar focus:border-[var(--primary-cyan)] focus:outline-none transition-colors min-h-[400px] resize-none"
                                    placeholder="Enter secure shift notes, anomalies, or field configurations here. Data actively synchronizes to your browser's persistent LocalStorage mechanism offline..."
                                    value={missionNotes}
                                    onChange={(e) => setMissionNotes(e.target.value)}
                                />
                                <div className="mt-4 flex justify-between items-center text-[10px] font-mono-data text-[var(--text-muted)] bg-[var(--void)] px-3 py-2 rounded">
                                    <span className="text-[var(--success)] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></span>
                                        CACHE SYNCED ALIVE
                                    </span>
                                    <span>{missionNotes.length} CHARACTERS CAPTURED</span>
                                </div>
                            </div>

                            {/* Secure Command History Logger */}
                            <div className="card-surface p-6 flex flex-col h-full border-t-4" style={{ borderTopColor: 'var(--warning)' }}>
                                <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4">
                                    <div>
                                        <h3 className="font-display font-semibold text-[var(--text-primary)] text-xl flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-[var(--warning)]" /> COMMAND HISTORY
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)] font-mono-data mt-1">Audit log of system overrides for {roverId}.</p>
                                    </div>
                                    <button onClick={() => setCommandHistory([])} className="text-[10px] uppercase font-mono-data bg-[var(--danger)]/10 text-[var(--danger)] px-2 py-1 rounded hover:bg-[var(--danger)] hover:text-white transition-colors border border-[var(--danger)]/20">
                                        Purge Audit Log
                                    </button>
                                </div>
                                <div className="flex-1 bg-[var(--void)] border border-[var(--border-color)] p-1 rounded overflow-hidden flex flex-col min-h-[400px]">
                                    <div className="bg-[#111827] text-white p-4 h-full overflow-y-auto custom-scrollbar font-mono-data text-xs rounded-sm">
                                        {commandHistory.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-50 text-center">
                                                <Activity className="w-8 h-8 mb-2" />
                                                <p>LOCAL STORAGE EMPTY.</p>
                                                <p>No functional commands dispatched yet.</p>
                                            </div>
                                        ) : (
                                            <ul className="space-y-4">
                                                {commandHistory.map((log, i) => (
                                                    <li key={i} className="flex gap-4 border-b border-gray-800 pb-2">
                                                        <span className="text-[#06B6D4] opacity-80 shrink-0">[{log.time}]</span>
                                                        <span className="text-white flex-1">{roverId}@root:~$ EXECUTED '{log.cmd}'</span>
                                                        <span className="text-[#10B981] shrink-0 font-bold tracking-wider">OK</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 text-[10px] font-mono-data text-[var(--text-muted)] px-1">
                                    * Array limited to last 15 commands inside browser localStorage memory.
                                </div>
                            </div>

                            {/* Live Backend Data Socket Mock */}
                            <div className="card-surface p-6 flex flex-col border-t-4" style={{ borderTopColor: 'var(--success)', maxHeight: '500px', overflow: 'auto' }}>
                                <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4">
                                    <div>
                                        <h3 className="font-display font-semibold text-[var(--text-primary)] text-xl flex items-center gap-2">
                                            <Wifi className="w-5 h-5 text-[var(--success)]" /> TERMINAL UPLINK
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)] font-mono-data mt-1">Simulated raw RTK feed for {roverId}.</p>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col min-h-[400px]">
                                    <LiveTerminal roverId={roverId} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'settings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="card-surface p-8 max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 mb-8 border-b border-[var(--border-color)] pb-6">
                                <div className="w-12 h-12 rounded bg-[var(--success)]/10 flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-[var(--success)]" />
                                </div>
                                <div>
                                    <h3 className="font-display font-semibold text-xl text-[var(--text-primary)]">Operator Config</h3>
                                    <p className="font-mono-data text-xs text-[var(--text-secondary)]">Manage your authentication details and configuration for {operatorName}</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Email */}
                                    <div>
                                        <label className="block font-mono-data text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                                            Operator Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full bg-[var(--void)] border border-[var(--border-color)] pl-10 pr-4 py-3 rounded text-[var(--text-primary)] text-sm font-mono-data focus:outline-none focus:border-[var(--primary-cyan)] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block font-mono-data text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                                            Secure Dispatch Line
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input
                                                type="text"
                                                value={profile.phone}
                                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full bg-[var(--void)] border border-[var(--border-color)] pl-10 pr-4 py-3 rounded text-[var(--text-primary)] text-sm font-mono-data focus:outline-none focus:border-[var(--primary-cyan)] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="md:col-span-2">
                                        <label className="block font-mono-data text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                                            Encryption Password
                                        </label>
                                        <div className="relative border border-[var(--border-color)] p-4 rounded bg-[var(--void)] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Lock className="w-4 h-4 text-[var(--danger)]" />
                                                <span className="font-mono-data text-sm">{profile.password}</span>
                                            </div>
                                            <button type="button" className="font-mono-data text-xs text-[var(--primary-cyan)] hover:text-white transition-colors">
                                                REQUEST ROTATION
                                            </button>
                                        </div>
                                        <p className="mt-2 font-mono-data text-[10px] text-[var(--text-muted)]">Passwords must be rotated every 90 days according to protocol.</p>
                                    </div>

                                    {/* Action Buttons Block */}
                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                                        <label className="block font-mono-data text-xs text-[var(--text-muted)] mb-3 flex items-center gap-2 tracking-wide">
                                            <Crosshair className="w-3.5 h-3.5" /> INSTANT ROVER MANAGEMENT FOR {roverId}
                                        </label>
                                        <div className="flex gap-4">
                                            <button type="button" onClick={() => handleRoverAction('reboot')} className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] px-4 py-2 rounded transition-colors text-[var(--text-primary)] text-sm font-mono-data">
                                                <Power className="w-4 h-4 text-[var(--primary-cyan)]" /> Reboot Node
                                            </button>
                                            <button type="button" onClick={() => handleRoverAction('firmware')} className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] px-4 py-2 rounded transition-colors text-[var(--text-primary)] text-sm font-mono-data">
                                                <RotateCcw className="w-4 h-4 text-[var(--success)]" /> Verify Firmware
                                            </button>
                                            <button type="button" onClick={() => handleRoverAction('halt')} className="flex items-center gap-2 bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 border border-[var(--danger)]/50 px-4 py-2 rounded transition-colors text-[var(--danger)] text-sm font-mono-data ml-auto">
                                                <AlertTriangle className="w-4 h-4" /> Emergency Halt
                                            </button>
                                        </div>
                                    </div>

                                    {/* Clearance */}
                                    <div className="md:col-span-2 bg-[var(--primary-cyan)]/5 border border-[var(--primary-cyan)]/20 p-4 rounded flex items-start gap-4 mt-2">
                                        <Shield className="w-8 h-8 text-[var(--primary-cyan)] shrink-0" />
                                        <div>
                                            <h4 className="font-mono-data text-sm text-[var(--primary-cyan)] mb-1">CLEARANCE: {profile.clearance}</h4>
                                            <p className="font-mono-data text-[10px] text-[var(--text-secondary)] leading-relaxed">
                                                You possess Omega-level access over sector operations. Escalation procedures are fully lifted for terminal overriding capabilities. Tampering tracked by central audit standard logs on {roverId}.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 flex items-center gap-2 rounded bg-[var(--primary-cyan)] text-white font-mono-data text-xs font-bold tracking-wider hover:bg-[var(--primary-cyan)]/90 transition-all"
                                    >
                                        {saved ? (
                                            <>✓ UPDATED</>
                                        ) : (
                                            <><Save className="w-3.5 h-3.5" /> SAVE CONFIGURATION</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
