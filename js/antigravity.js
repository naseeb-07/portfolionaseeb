import * as THREE from 'three';

export function initAntigravity() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Configuration
    const config = {
        count: 300,
        magnetRadius: 10,
        ringRadius: 10,
        waveSpeed: 0.4,
        waveAmplitude: 1,
        particleSize: 2,
        lerpSpeed: 0.1,
        color: ' #e4e4e4ff',
        autoAnimate: false,
        particleVariance: 1,
        rotationSpeed: 0,
        depthFactor: 1,
        pulseSpeed: 3,
        fieldStrength: 10
    };

    // State Variables
    let width = window.innerWidth;
    let height = window.innerHeight;
    const lastMousePos = { x: 0, y: 0 };
    let lastMouseMoveTime = 0;
    const virtualMouse = { x: 0, y: 0 };
    const dummy = new THREE.Object3D();

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = ''; // Clear previous
    container.appendChild(renderer.domElement);

    // Particle Data Generation
    const particles = [];
    // Calculate viewport size at z=0 for accurate positioning
    // For fov=35, z=50:
    const vHeight = 2 * Math.tan((35 * Math.PI) / 180 / 2) * 50;
    const vWidth = vHeight * (width / height);

    for (let i = 0; i < config.count; i++) {
        const t = Math.random() * 100;
        const factor = 20 + Math.random() * 100;
        const speed = 0.01 + Math.random() / 200;
        const x = (Math.random() - 0.5) * vWidth;
        const y = (Math.random() - 0.5) * vHeight;
        const z = (Math.random() - 0.5) * 20;

        const randomRadiusOffset = (Math.random() - 0.5) * 2;

        particles.push({
            t,
            factor,
            speed,
            mx: x,
            my: y,
            mz: z,
            cx: x,
            cy: y,
            cz: z,
            vx: 0,
            vy: 0,
            vz: 0,
            randomRadiusOffset
        });
    }

    // Instanced Mesh
    // Capsule Geometry: radius, length, capSegments, radialSegments
    const geometry = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
    const material = new THREE.MeshBasicMaterial({ color: config.color });
    const mesh = new THREE.InstancedMesh(geometry, material, config.count);
    scene.add(mesh);

    // Interaction
    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        // Normalize mouse to -1 to 1
        mouse.x = (e.clientX / width) * 2 - 1;
        mouse.y = -(e.clientY / height) * 2 + 1; // Invert Y

        lastMousePos.x = mouse.x;
        lastMousePos.y = mouse.y;
        lastMouseMoveTime = Date.now();
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Virtual Mouse Update
        let destX = (mouse.x * vWidth) / 2;
        let destY = (mouse.y * vHeight) / 2;

        // Auto Animate Fallback
        if (config.autoAnimate && Date.now() - lastMouseMoveTime > 2000) {
            destX = Math.sin(time * 0.5) * (vWidth / 4);
            destY = Math.cos(time * 0.5 * 2) * (vHeight / 4);
        }

        const smoothFactor = 0.05;
        virtualMouse.x += (destX - virtualMouse.x) * smoothFactor;
        virtualMouse.y += (destY - virtualMouse.y) * smoothFactor;

        const targetX = virtualMouse.x;
        const targetY = virtualMouse.y;
        const globalRotation = time * config.rotationSpeed;

        // Update Each Particle
        for (let i = 0; i < config.count; i++) {
            const p = particles[i];

            // Advance internal time
            p.t += p.speed / 2;

            const projectionFactor = 1 - p.cz / 50;
            const projectedTargetX = targetX * projectionFactor;
            const projectedTargetY = targetY * projectionFactor;

            const dx = p.mx - projectedTargetX;
            const dy = p.my - projectedTargetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetPos = { x: p.mx, y: p.my, z: p.mz * config.depthFactor };

            // Magnetic Attraction Logic
            if (dist < config.magnetRadius) {
                const angle = Math.atan2(dy, dx) + globalRotation;
                const wave = Math.sin(p.t * config.waveSpeed + angle) * (0.5 * config.waveAmplitude);
                const deviation = p.randomRadiusOffset * (5 / (config.fieldStrength + 0.1));

                const currentRingRadius = config.ringRadius + wave + deviation;

                targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
                targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
                targetPos.z = p.mz * config.depthFactor + Math.sin(p.t) * (1 * config.waveAmplitude * config.depthFactor);
            }

            // Lerp towards target
            p.cx += (targetPos.x - p.cx) * config.lerpSpeed;
            p.cy += (targetPos.y - p.cy) * config.lerpSpeed;
            p.cz += (targetPos.z - p.cz) * config.lerpSpeed;

            // Update Dummy Object
            dummy.position.set(p.cx, p.cy, p.cz);
            dummy.lookAt(projectedTargetX, projectedTargetY, p.cz);
            dummy.rotateX(Math.PI / 2); // Orient capsule along direction

            // Scale Logic
            const currentDistToMouse = Math.sqrt(
                Math.pow(p.cx - projectedTargetX, 2) + Math.pow(p.cy - projectedTargetY, 2)
            );
            const distFromRing = Math.abs(currentDistToMouse - config.ringRadius);
            let scaleFactor = 1 - distFromRing / 10;
            scaleFactor = Math.max(0, Math.min(1, scaleFactor));
            const finalScale = scaleFactor * (0.8 + Math.sin(p.t * config.pulseSpeed) * 0.2 * config.particleVariance) * config.particleSize;

            dummy.scale.set(finalScale, finalScale, finalScale);
            dummy.updateMatrix();

            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;

        // Recalculate viewport dimensions
        const newVHeight = 2 * Math.tan((35 * Math.PI) / 180 / 2) * 50;
        const newVWidth = newVHeight * (width / height);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}
