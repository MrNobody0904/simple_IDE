import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080B0A, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Floating Cyber Particles
    const particleCount = prefersReducedMotion ? 100 : 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color('#C6F432'); // Lime
    const color2 = new THREE.Color('#64B5F6'); // Cyan/Blue
    const color3 = new THREE.Color('#929B95'); // Grey

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const mixed = Math.random() < 0.4 ? color1 : Math.random() < 0.7 ? color2 : color3;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 3. Floating Geometric Wireframe Objects
    // Icosahedron (Lime Wireframe)
    const icoGeo = new THREE.IcosahedronGeometry(4.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xC6F432,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    icosahedron.position.set(12, 3, -5);
    scene.add(icosahedron);

    // Torus Knot (Cyan Wireframe)
    const torusGeo = new THREE.TorusKnotGeometry(3, 0.7, 80, 16);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x64B5F6,
      wireframe: true,
      transparent: true,
      opacity: 0.14
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(-14, -6, -8);
    scene.add(torus);

    // Octahedron (Subtle Secondary)
    const octGeo = new THREE.OctahedronGeometry(2.5, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0xF4F4F0,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const octahedron = new THREE.Mesh(octGeo, octMat);
    octahedron.position.set(8, -10, -3);
    scene.add(octahedron);

    // 4. Subtle Wireframe Cyber Ground Grid
    const gridHelper = new THREE.GridHelper(80, 40, 0x292D34, 0x171B20);
    gridHelper.position.y = -16;
    scene.add(gridHelper);

    // 5. Mouse Parallax Reaction
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetX = ((e.clientX - halfW) / halfW) * 2;
      targetY = (-(e.clientY - halfH) / halfH) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Slow rotation of geometric objects
        icosahedron.rotation.x = elapsedTime * 0.12;
        icosahedron.rotation.y = elapsedTime * 0.18;

        torus.rotation.x = elapsedTime * 0.15;
        torus.rotation.y = elapsedTime * 0.22;

        octahedron.rotation.y = elapsedTime * 0.2;
        octahedron.rotation.z = elapsedTime * 0.15;

        // Particle subtle drift
        particles.rotation.y = elapsedTime * 0.02;
        particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.03;
      }

      // Smooth camera interpolation towards mouse target
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      particleMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      gridHelper.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-85"
      aria-hidden="true"
    />
  );
}
