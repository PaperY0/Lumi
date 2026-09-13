import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * HeroScene — Three.js stage for the Blender-authored `lumi-hero.glb`
 * (built by tools/blender-mcp/build_hero.py). Renders a rose crystal heart
 * wrapped in two jewel-tone ribbons and a detailed gold orbit, lit by a
 * warm/cool studio rig so the silhouette stays clear on the pale canvas.
 * Idle motion is a slow orbital drift; pointer position nudges the
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
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.28, 6.7);
    camera.lookAt(0, 0, 0);

    // A directional jewellery-style rig: warm key for the rose core, violet
    // fill for ribbon separation, and a crisp rim for the gold orbit.
    const key = new THREE.DirectionalLight(0xffd7df, 3.2); key.position.set(3.5, 4.5, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xbca7ff, 1.8); fill.position.set(-4, -1.2, 3.5); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffbf82, 2.3); rim.position.set(1, 2.5, -5); scene.add(rim);
    const core = new THREE.PointLight(0xff527d, 7, 8, 2); core.position.set(0, 0.15, 2.4); scene.add(core);
    scene.add(new THREE.AmbientLight(0xfff7fb, 0.48));

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
          if (!m) return;
          m.envMapIntensity = 1.55;
          if (mesh.name === 'HeartGem') {
            m.color.set(0xd1355f);
            m.roughness = 0.12;
            m.metalness = 0.04;
            m.transmission = 0.14;
            m.thickness = 0.8;
            m.ior = 1.48;
            m.attenuationColor = new THREE.Color(0x9d183f);
            m.attenuationDistance = 1.35;
            m.clearcoat = 0.78;
            m.clearcoatRoughness = 0.08;
          } else if (mesh.name.includes('RibbonPlum')) {
            m.color.set(0x5a2346);
            m.metalness = 0.34;
            m.roughness = 0.2;
            m.clearcoat = 0.48;
          } else if (mesh.name.includes('RibbonLilac')) {
            m.color.set(0x81509a);
            m.metalness = 0.28;
            m.roughness = 0.22;
            m.clearcoat = 0.44;
          } else if (mesh.name.includes('HaloRing') || mesh.name.includes('GoldNode')) {
            m.color.set(0xd3974e);
            m.metalness = 0.92;
            m.roughness = 0.15;
          } else if (mesh.name.includes('Pearl')) {
            m.color.set(0xffd7d9);
            m.emissive?.set(0xb83258);
            m.emissiveIntensity = 0.32;
          }
        });
        // Normalise scale so the halo ring fits the canvas.
        const box = new THREE.Box3().setFromObject(root);
        const dims = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        // Leave optical breathing room around the jewellery orbit; a tighter
        // fit makes the gold ring look accidentally clipped at the canvas edge.
        const k = 3.78 / Math.max(dims.x, dims.y, dims.z);
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
        background: 'radial-gradient(circle at 50% 46%, rgba(246,194,211,0.5) 0%, rgba(208,176,222,0.24) 32%, rgba(244,209,177,0.14) 54%, transparent 72%)',
        filter: 'drop-shadow(0 28px 42px rgba(94, 32, 66, 0.15))',
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
