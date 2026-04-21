import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AlertManager() {
    useEffect(() => {
        // Generate an alert every 30 seconds
        const interval = setInterval(() => {
            const isCritical = Math.random() > 0.7;
            const rovers = ['ROV-1042', 'ROV-2099', 'ROV-5512', 'ROV-8821', 'ROV-3321', 'ROV-7711'];
            const actions = [
                'entered prohibited area',
                'reports low battery',
                'lost GPS signal',
                'temperature critical',
                'motor stall detected'
            ];
            const rover = rovers[Math.floor(Math.random() * rovers.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];

            if (isCritical) {
                toast.error(`Critical Alert: ${rover} ${action}`, {
                    description: new Date().toLocaleTimeString(),
                    duration: 6000,
                });
            } else {
                toast.warning(`Warning: ${rover} ${action}`, {
                    description: new Date().toLocaleTimeString(),
                    duration: 4000,
                });
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
