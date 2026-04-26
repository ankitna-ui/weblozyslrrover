import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    userRole: 'LEVEL1' | 'LEVEL2' | 'LEVEL3' | null;
    assignedMultiZone: number | null;
    assignedZone: number | null;
    assignedDistrict: string | null;
    roverId: string | null;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    selectRover: (id: string) => void;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<'LEVEL1' | 'LEVEL2' | 'LEVEL3' | null>(null);
    const [assignedMultiZone, setAssignedMultiZone] = useState<number | null>(null);
    const [assignedZone, setAssignedZone] = useState<number | null>(null);
    const [assignedDistrict, setAssignedDistrict] = useState<string | null>(null);
    const [roverId, setRoverId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const savedLogin = localStorage.getItem('__rvr_auth_valid');
        const savedRole = localStorage.getItem('__rvr_role') as any;
        const savedMZ = localStorage.getItem('__rvr_mz');
        const savedZone = localStorage.getItem('__rvr_zone');
        const savedDistrict = localStorage.getItem('__rvr_district');
        const savedRover = localStorage.getItem('__rvr_active_id');

        if (savedLogin === 'true') {
            setIsLoggedIn(true);
            if (savedRole) setUserRole(savedRole);
            if (savedMZ) setAssignedMultiZone(parseInt(savedMZ));
            if (savedZone) setAssignedZone(parseInt(savedZone));
            if (savedDistrict) setAssignedDistrict(savedDistrict);
            if (savedRover) setRoverId(savedRover);
        }
    }, []);

    const login = (usr: string, pass: string) => {
        const u = usr;
        let role: 'LEVEL1' | 'LEVEL2' | 'LEVEL3' | null = null;
        let mz: number | null = null;
        let zone: number | null = null;
        let district: string | null = null;

        if (u === 'L1admin' && pass === 'L1admin') {
            role = 'LEVEL1';
            mz = 1; // Assigned to Multi-Zone 1
        } else if (u === 'L2admin' && pass === 'L2admin') {
            role = 'LEVEL2';
            zone = 4; // Assigned to Zone 4 (MZ 2) - Disjoint from L1
        } else if (u === 'L3admin' && pass === 'L3admin') {
            role = 'LEVEL3';
            district = 'nalgonda'; // Assigned to Nalgonda (Zone 7, MZ 2) - Disjoint from L1 & L2
        } else if (u.toLowerCase() === 'admin' && pass === 'admin') {
            role = null; // Super Admin sees everything
        }

        if (role || (u.toLowerCase() === 'admin' && pass === 'admin')) {
            setIsLoggedIn(true);
            setUserRole(role);
            setAssignedMultiZone(mz);
            setAssignedZone(zone);
            setAssignedDistrict(district);
            
            localStorage.setItem('__rvr_auth_valid', 'true');
            if (role) localStorage.setItem('__rvr_role', role);
            if (mz) localStorage.setItem('__rvr_mz', mz.toString());
            if (zone) localStorage.setItem('__rvr_zone', zone.toString());
            if (district) localStorage.setItem('__rvr_district', district);
            localStorage.setItem('__rvr_login_time', new Date().toISOString());
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserRole(null);
        setAssignedMultiZone(null);
        setAssignedZone(null);
        setAssignedDistrict(null);
        setRoverId(null);
        localStorage.removeItem('__rvr_auth_valid');
        localStorage.removeItem('__rvr_role');
        localStorage.removeItem('__rvr_mz');
        localStorage.removeItem('__rvr_zone');
        localStorage.removeItem('__rvr_district');
        localStorage.removeItem('__rvr_active_id');
    };

    const selectRover = (id: string) => {
        setRoverId(id);
        localStorage.setItem('__rvr_active_id', id);
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            userRole, 
            assignedMultiZone,
            assignedZone, 
            assignedDistrict, 
            roverId, 
            login, 
            logout, 
            selectRover, 
            showModal, 
            setShowModal 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
