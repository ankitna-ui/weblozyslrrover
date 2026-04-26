import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { districts as allDistricts } from '@/data/districts';
import type { District } from '@/data/types';

export default function Globe({ filteredDistricts }: { filteredDistricts?: District[] }) {
    const mountRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const activeDistricts = filteredDistricts || allDistricts;

    useEffect(() => {
        let frameId: number;
        let THREE: any;
        let scene: any, camera: any, renderer: any;
        let globe: any;

        const init = async () => {
            THREE = await import('three');
            if (!mountRef.current) return;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
            camera.position.z = 10;

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current.appendChild(renderer.domElement);

            // Low poly globe
            const geometry = new THREE.IcosahedronGeometry(3, 2);
            const material = new THREE.MeshBasicMaterial({
                color: 0x0891B2,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            globe = new THREE.Mesh(geometry, material);
            scene.add(globe);

            // Add district markers (dummy positions for now)
            activeDistricts.forEach((d, i) => {
                const phi = Math.acos(-1 + (2 * i) / activeDistricts.length);
                const theta = Math.sqrt(activeDistricts.length * Math.PI) * phi;
                const x = 3.1 * Math.cos(theta) * Math.sin(phi);
                const y = 3.1 * Math.sin(theta) * Math.sin(phi);
                const z = 3.1 * Math.cos(phi);

                const mGeo = new THREE.SphereGeometry(0.1, 8, 8);
                const mMat = new THREE.MeshBasicMaterial({ color: d.corsStatus === 'connected' ? 0x10B981 : 0xEF4444 });
                const marker = new THREE.Mesh(mGeo, mMat);
                marker.position.set(x, y, z);
                marker.userData = { id: d.id, name: d.name };
                globe.add(marker);
            });

            const animate = () => {
                frameId = requestAnimationFrame(animate);
                globe.rotation.y += 0.002;
                globe.rotation.x += 0.0005;
                renderer.render(scene, camera);
            };

            animate();
        };

        init();

        const handleResize = () => {
            if (!camera || !renderer || !mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (frameId) cancelAnimationFrame(frameId);
            if (mountRef.current && renderer?.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            if (renderer) renderer.dispose();
        };
    }, [navigate, activeDistricts]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div ref={mountRef} className="w-full h-full min-h-[400px]" style={{ cursor: 'pointer' }} />
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <p className="font-mono-data text-xs text-text-muted">Interactive 3D Globe Load Successful</p>
            </div>
        </div>
    );
}
