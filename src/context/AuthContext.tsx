import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
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
    const [roverId, setRoverId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const savedLogin = localStorage.getItem('__rvr_auth_valid');
        const savedRover = localStorage.getItem('__rvr_active_id');

        if (savedLogin === 'true') {
            setIsLoggedIn(true);
            if (savedRover) setRoverId(savedRover);
        }
    }, []);

    // No automatic showModal force. Modal is manually triggered.

    const login = (usr: string, pass: string) => {
        if (usr.toLowerCase() === 'admin' && pass === 'admin') {
            setIsLoggedIn(true);
            localStorage.setItem('__rvr_auth_valid', 'true');
            localStorage.setItem('__rvr_login_time', new Date().toISOString());
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
        setRoverId(null);
        localStorage.removeItem('__rvr_auth_valid');
        localStorage.removeItem('__rvr_active_id');
    };

    const selectRover = (id: string) => {
        setRoverId(id);
        localStorage.setItem('__rvr_active_id', id);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, roverId, login, logout, selectRover, showModal, setShowModal }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
