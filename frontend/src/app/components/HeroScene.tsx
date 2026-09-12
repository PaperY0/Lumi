import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * HeroScene — Three.js stage for the Blender-authored `lumi-hero.glb`
 * (built by tools/blender-mcp/build_hero.py). Renders a transmissive heart
 * wrapped in two ribbons and a gold halo, lit by a neutral studio env-map so
 * the asset picks up the page's warm pastel palette instead of hard studio
 * whites. Idle motion is a slow orbital drift; pointer position nudges the
 * whole group for parallax. Honors prefers-reduced-motion and degrades to a
 * static CSS glow when WebGL is unavailable.
 */

interface HeroSceneProps {
  /** CSS size of the canvas box. */
  size?: number;
  className?: string;
}

const MODEL_URL = '/models/lumi-hero.glb';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function HeroScene({ size = 420, className }: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!webglAvailable()) { setFallback(true); return; }

    const reduced = prefersReducedMotion();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.35, 7.2);
    camera.lookAt(0, 0, 0);

    // Warm key + cool fill so the transmissive heart reads pink/lilac, not grey.
    const key = new THREE.DirectionalLight(0xfff1f4, 2.2); key.position.set(3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xe6d8ff, 1.1); fill.position.set(-4, -1, 3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffd9c2, 1.4); rim.position.set(0, 2, -5); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const group = new THREE.Group();
    scene.add(group);

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const m = mesh.material as THREE.MeshPhysicalMaterial;
          if (m && 'transmission' in m && m.transmission > 0) {
            // Glass heart: push thickness/ior so refraction is visible at this scale.
            m.thickness = 1.2; m.ior = 1.5; m.roughness = 0.08;
            m.attenuationColor = new THREE.Color(0xf7c9d6); m.attenuationDistance = 2.2;
            m.envMapIntensity = 1.4;
          } else if (m) {
            m.envMapIntensity = 1.1;
          }
        });
        // Normalise scale so the halo ring fits the canvas.
        const box = new THREE.Box3().setFromObject(root);
        const dims = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const k = 3.9 / Math.max(dims.x, dims.y, dims.z);
        root.scale.setScalar(k);
        root.position.copy(center.multiplyScalar(-k));
        group.add(root);
        setReady(true);
      },
      undefined,
      () => { if (!disposed) setFallback(true); },
    );

    // Pointer parallax (normalized -1..1), eased each frame.
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => { target.x = 0; target.y = 0; };
    window.addEventListener('pointermove', onMove, { passive: true });
    mount.addEventListener('pointerleave', onLeave);

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      const t = clock.getElapsedTime();
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      if (!reduced) {
        group.rotation.y = t * 0.22 + current.x * 0.35;
        group.rotation.x = Math.sin(t * 0.35) * 0.08 + current.y * 0.25;
        group.position.y = Math.sin(t * 0.8) * 0.07;
      } else {
        group.rotation.y = current.x * 0.25;
        group.rotation.x = current.y * 0.18;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // Pause when off-screen / tab hidden.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { if (!raf) raf = requestAnimationFrame(render); }
      else { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerleave', onLeave);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m?.dispose());
        }
      });
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className={className}
      aria-hidden
      style={{
        width: size, height: size, position: 'relative', flexShrink: 0,
        borderRadius: '50%',
        // While the GLB streams in, show the same blush glow so there's no pop.
        background: 'radial-gradient(circle at 50% 46%, rgba(248,224,232,0.85) 0%, rgba(236,206,222,0.4) 38%, rgba(236,206,222,0.12) 58%, transparent 70%)',
        opacity: fallback || ready ? 1 : 0.7,
        transition: 'opacity 0.8s ease',
      }}
    >
      {fallback && (
        <div style={{ position: 'absolute', inset: '28%', borderRadius: '50%', border: '1px solid rgba(191,142,110,0.55)', boxShadow: '0 0 60px rgba(212,96,122,0.25)' }} />
      )}
    </div>
  );
}
