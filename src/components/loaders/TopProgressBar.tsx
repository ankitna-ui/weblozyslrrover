import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function TopProgressBar() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsVisible(true);
        setProgress(10);

        const interval = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 85) {
                    clearInterval(interval);
                    return 85;
                }
                return oldProgress + Math.random() * 15;
            });
        }, 100);

        const timeout = setTimeout(() => {
            setProgress(100);
            clearInterval(interval);
            setTimeout(() => setIsVisible(false), 300);
        }, 400); // Simulate route load completion

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [location.pathname]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed top-0 left-0 z-50 h-[2px] transition-all duration-200 ease-out"
            style={{
                width: `${progress}%`,
                backgroundColor: 'var(--primary-cyan)',
                boxShadow: '0 0 10px var(--primary-cyan), 0 0 5px var(--primary-cyan)',
            }}
        />
    );
}
