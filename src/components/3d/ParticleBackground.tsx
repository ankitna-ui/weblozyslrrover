import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let frameId: number;
        let THREE: any;
        let scene: any, camera: any, renderer: any;
        let particles: any, lines: any;
        const particlePositions: number[] = [];
        const particleVelocities: { x: number, y: number, z: number }[] = [];
        let positionsAttr: any;

        const init = async () => {
            THREE = await import('three');
            if (!mountRef.current) return;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 120;

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current.appendChild(renderer.domElement);

            const maxParticleCount = 100;
            const r = 200;

            for (let i = 0; i < maxParticleCount; i++) {
                particlePositions.push(
                    (Math.random() * r - r / 2),
                    (Math.random() * r - r / 2),
                    (Math.random() * r - r / 2)
                );
                particleVelocities.push({
                    x: -1 + Math.random() * 2,
                    y: -1 + Math.random() * 2,
                    z: -1 + Math.random() * 2
                });
            }

            const particlesGeometry = new THREE.BufferGeometry();
            particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

            const pMaterial = new THREE.PointsMaterial({
                color: 0x06B6D4,
                size: 3,
                blending: THREE.AdditiveBlending,
                transparent: true,
                sizeAttenuation: true
            });

            particles = new THREE.Points(particlesGeometry, pMaterial);
            scene.add(particles);

            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = new Float32Array(maxParticleCount * maxParticleCount * 3);
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
            const colors = new Float32Array(maxParticleCount * maxParticleCount * 3);
            lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(lines);

            positionsAttr = particlesGeometry.attributes.position;
            const linePosAttr = lineGeometry.attributes.position;
            const lineColAttr = lineGeometry.attributes.color;

            const animate = () => {
                let vertexpos = 0;
                let colorpos = 0;
                let numConnected = 0;

                for (let i = 0; i < maxParticleCount; i++) {
                    positionsAttr.array[i * 3] += particleVelocities[i].x * 0.1;
                    positionsAttr.array[i * 3 + 1] += particleVelocities[i].y * 0.1;
                    positionsAttr.array[i * 3 + 2] += particleVelocities[i].z * 0.1;

                    if (positionsAttr.array[i * 3] > r / 2 || positionsAttr.array[i * 3] < -r / 2) particleVelocities[i].x *= -1;
                    if (positionsAttr.array[i * 3 + 1] > r / 2 || positionsAttr.array[i * 3 + 1] < -r / 2) particleVelocities[i].y *= -1;
                    if (positionsAttr.array[i * 3 + 2] > r / 2 || positionsAttr.array[i * 3 + 2] < -r / 2) particleVelocities[i].z *= -1;

                    for (let j = i + 1; j < maxParticleCount; j++) {
                        const dx = positionsAttr.array[i * 3] - positionsAttr.array[j * 3];
                        const dy = positionsAttr.array[i * 3 + 1] - positionsAttr.array[j * 3 + 1];
                        const dz = positionsAttr.array[i * 3 + 2] - positionsAttr.array[j * 3 + 2];
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                        if (dist < 40) {
                            linePosAttr.array[vertexpos++] = positionsAttr.array[i * 3];
                            linePosAttr.array[vertexpos++] = positionsAttr.array[i * 3 + 1];
                            linePosAttr.array[vertexpos++] = positionsAttr.array[i * 3 + 2];

                            linePosAttr.array[vertexpos++] = positionsAttr.array[j * 3];
                            linePosAttr.array[vertexpos++] = positionsAttr.array[j * 3 + 1];
                            linePosAttr.array[vertexpos++] = positionsAttr.array[j * 3 + 2];

                            const alpha = 1.0 - dist / 40;
                            for (let c = 0; c < 6; c++) {
                                lineColAttr.array[colorpos++] = 0.02 * alpha; // R
                                lineColAttr.array[colorpos++] = 0.71 * alpha; // G
                                lineColAttr.array[colorpos++] = 0.83 * alpha; // B
                            }
                            numConnected++;
                        }
                    }
                }

                lineGeometry.setDrawRange(0, numConnected * 2);
                positionsAttr.needsUpdate = true;
                linePosAttr.needsUpdate = true;
                lineColAttr.needsUpdate = true;

                particles.rotation.y += 0.001;
                lines.rotation.y += 0.001;

                renderer.render(scene, camera);
                frameId = requestAnimationFrame(animate);
            };

            animate();
        };

        init();

        const handleResize = () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (frameId) cancelAnimationFrame(frameId);
            if (mountRef.current && renderer?.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            if (renderer) renderer.dispose();
            // Three.js cleanup
            if (particles) {
                particles.geometry.dispose();
                particles.material.dispose();
            }
            if (lines) {
                lines.geometry.dispose();
                lines.material.dispose();
            }
        };
    }, []);

    return <div ref={mountRef} className="fixed inset-0 pointer-events-none -z-10 opacity-40 dark:opacity-20" />;
}
