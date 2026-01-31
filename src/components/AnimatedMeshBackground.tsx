import { useEffect, useRef, Suspense, lazy } from "react";

/**
 * AnimatedMeshBackground - Creates a subtle 3D animated mesh background using Three.js
 * Renders a flowing, liquid-like animation that serves as a modern backdrop
 */
export const AnimatedMeshBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Dynamic import to avoid blocking render and reduce initial bundle
    let animationId: number;

    const initThree = async () => {
      try {
        const THREE = await import("three");

        const canvas = canvasRef.current!;
        const container = containerRef.current!;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance

        // Create animated geometry
        const geometry = new THREE.IcosahedronGeometry(2, 4);
        const material = new THREE.MeshPhongMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          wireframe: false,
          shininess: 100,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add lighting
        const light1 = new THREE.PointLight(0x10b981, 1, 100);
        light1.position.set(5, 5, 5);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x0ea5e9, 0.5, 100);
        light2.position.set(-5, -5, 5);
        scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Handle window resize
        const handleResize = () => {
          if (!container) return;
          const width = container.clientWidth;
          const height = container.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        // Animation loop
        let time = 0;
        let targetFPS = 60;
        let lastFrameTime = Date.now();

        const animate = () => {
          animationId = requestAnimationFrame(animate);

          // FPS throttling for performance
          const now = Date.now();
          const deltaTime = now - lastFrameTime;
          const frameInterval = 1000 / targetFPS;

          if (deltaTime >= frameInterval) {
            lastFrameTime = now - (deltaTime % frameInterval);
            time += 0.001;

            // Morph geometry with sine wave for liquid effect
            const positionAttribute = geometry.getAttribute("position");
            const originalPositions = positionAttribute.array as Float32Array;
            const positions = new Float32Array(originalPositions);

            for (let i = 0; i < positions.length; i += 3) {
              const x = originalPositions[i];
              const y = originalPositions[i + 1];
              const z = originalPositions[i + 2];

              positions[i] = x + Math.sin(time + y) * 0.02;
              positions[i + 1] = y + Math.cos(time + z) * 0.02;
              positions[i + 2] = z + Math.sin(time + x) * 0.02;
            }

            positionAttribute.needsUpdate = true;
            geometry.computeVertexNormals();

            mesh.rotation.x += 0.0002;
            mesh.rotation.y += 0.0003;
            mesh.scale.x = 1 + Math.sin(time * 0.5) * 0.05;
            mesh.scale.y = 1 + Math.cos(time * 0.5) * 0.05;

            renderer.render(scene, camera);
          } else {
            animationId = requestAnimationFrame(animate);
          }
        };

        animate();

        // Cleanup function
        const cleanup = () => {
          window.removeEventListener("resize", handleResize);
          cancelAnimationFrame(animationId);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
        };

        return cleanup;
      } catch (error) {
        console.error("Failed to initialize Three.js background:", error);
      }
    };

    const cleanupPromise = initThree();

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Gradient fallback while Three.js loads */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
