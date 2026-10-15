'use client';
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Edges, Grid, Html, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Caja, Escena } from '@/lib/buildScene';

type Props = {
  escena: Escena;
  girar: boolean; // giro final de 360° al enviar
  onCaptura: (fn: () => string) => void;
};

const VEL = 6; // velocidad de interpolación (1/s)

// Una pieza de la maqueta: crece desde el piso al aparecer y se interpola a su nueva medida/color.
function Pieza({ c }: { c: Caja }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const color = useMemo(() => new THREE.Color(c.color), [c.color]);
  const invalidate = useThree((s) => s.invalidate);
  const caer = c.tipo === 'mueble' || c.tipo === 'aviso';

  useEffect(() => {
    // Estado inicial: los muros salen del piso; los muebles caen desde arriba.
    const m = ref.current!;
    m.scale.set(c.w, 0.001, c.d);
    m.position.set(c.x, caer ? c.y + 2.5 : 0, c.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, dt) => {
    const m = ref.current!;
    const k = 1 - Math.exp(-VEL * Math.min(dt, 0.05));
    m.scale.x += (c.w - m.scale.x) * k;
    m.scale.y += (c.h - m.scale.y) * k;
    m.scale.z += (c.d - m.scale.z) * k;
    m.position.x += (c.x - m.position.x) * k;
    m.position.y += (c.y - m.position.y) * k;
    m.position.z += (c.z - m.position.z) * k;
    mat.current!.color.lerp(color, k);
    const resta = Math.abs(c.h - m.scale.y) + Math.abs(c.y - m.position.y) + Math.abs(c.w - m.scale.x) + Math.abs(c.d - m.scale.z) + Math.abs(c.x - m.position.x) + Math.abs(c.z - m.position.z);
    if (resta > 0.002) invalidate();
  });

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial
        ref={mat}
        roughness={c.tipo === 'vidrio' ? 0.05 : 0.85}
        transparent={c.tipo === 'vidrio'}
        opacity={c.tipo === 'vidrio' ? 0.35 : 1}
        emissive={c.tipo === 'luminaria' || c.tipo === 'aviso' ? c.color : '#000000'}
        emissiveIntensity={c.tipo === 'luminaria' ? 1.4 : c.tipo === 'aviso' ? 0.35 : 0}
      />
      {c.tipo === 'muro' && <Edges color="#362b25" threshold={15} lineWidth={0.6} />}
    </mesh>
  );
}

// Piso y luces con transición de color e intensidad.
function Ambiente({ escena }: { escena: Escena }) {
  const piso = useRef<THREE.MeshStandardMaterial>(null);
  const fondo = useRef<THREE.Color>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const sol = useRef<THREE.DirectionalLight>(null);
  const invalidate = useThree((s) => s.invalidate);
  const meta = useMemo(
    () => ({ piso: new THREE.Color(escena.paleta.piso), fondo: new THREE.Color(escena.paleta.fondo), calida: new THREE.Color('#ffe2b8').lerp(new THREE.Color('#ffffff'), 1 - escena.luz) }),
    [escena.paleta, escena.luz],
  );
  const resta = useRef(0);
  useEffect(() => {
    resta.current = 1.5; // segundos de transición tras cada cambio de estilo o luz
    invalidate();
  }, [meta, invalidate]);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const k = 1 - Math.exp(-4 * d);
    piso.current?.color.lerp(meta.piso, k);
    fondo.current!.lerp(meta.fondo, k);
    sol.current!.color.lerp(meta.calida, k);
    amb.current!.intensity += (0.55 + escena.luz * 0.6 - amb.current!.intensity) * k;
    resta.current -= d;
    if (resta.current > 0) invalidate();
  });
  return (
    <>
      <color ref={fondo} attach="background" args={[escena.paleta.fondo]} />
      <ambientLight ref={amb} intensity={0.8} />
      <directionalLight ref={sol} position={[6, 12, 8]} intensity={1.6} />
      <hemisphereLight args={['#ffffff', '#cfc3b3', 0.4]} />
      <Grid args={[60, 60]} position={[0, -0.002, 0]} cellSize={0.5} sectionSize={2.5} cellColor="#cfc3b3" sectionColor="#bdb2a0" fadeDistance={escena.lote ? 40 : 28} infiniteGrid />
      {escena.vista !== 'vacia' && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} scale={[escena.W, escena.D, 1]}>
          <planeGeometry />
          <meshStandardMaterial ref={piso} color={escena.paleta.piso} transparent opacity={escena.lote ? 0.25 : 1} />
        </mesh>
      )}
    </>
  );
}

// Cotas con medidas reales en metros.
function Cotas({ escena }: { escena: Escena }) {
  const { W, D } = escena;
  const o = 0.7;
  const lbl = 'pointer-events-none whitespace-nowrap bg-crema/90 px-1.5 font-mono text-[10px] tracking-widest text-espresso';
  return (
    <group>
      <Line points={[[-W / 2, 0.01, D / 2 + o], [W / 2, 0.01, D / 2 + o]]} color="#362b25" lineWidth={1} />
      <Line points={[[-W / 2, 0.01, D / 2 + o - 0.2], [-W / 2, 0.01, D / 2 + o + 0.2]]} color="#362b25" lineWidth={1} />
      <Line points={[[W / 2, 0.01, D / 2 + o - 0.2], [W / 2, 0.01, D / 2 + o + 0.2]]} color="#362b25" lineWidth={1} />
      <Line points={[[-W / 2 - o, 0.01, -D / 2], [-W / 2 - o, 0.01, D / 2]]} color="#362b25" lineWidth={1} />
      <Html zIndexRange={[20, 0]} position={[0, 0.02, D / 2 + o]} center><span className={lbl}>{escena.ancho.toFixed(2)} m</span></Html>
      <Html zIndexRange={[20, 0]} position={[-W / 2 - o, 0.02, 0]} center><span className={lbl}>{escena.fondo.toFixed(2)} m</span></Html>
    </group>
  );
}

// Cámara: se acomoda sola al cambiar de vista y gira 360° al enviar; el usuario puede orbitar.
function Camara({ escena, girar }: { escena: Escena; girar: boolean }) {
  const { camera, invalidate, size } = useThree();
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;
  const destino = useRef<THREE.Vector3 | null>(null);
  const giro = useRef(0);
  const plano = escena.vista === 'plano';
  // Más lejos en lienzos altos (móvil, columna estrecha) para que quepa todo el ancho.
  const dist = Math.round(((12 + escena.D * 0.7) / Math.min(1, size.width / size.height / 1.25)) * 10) / 10;

  useEffect(() => {
    destino.current = plano ? new THREE.Vector3(0, dist * 1.3, 0.01) : new THREE.Vector3(dist * 0.55, dist * 0.6, dist * 0.8);
    invalidate();
  }, [plano, dist, invalidate]);

  useEffect(() => {
    if (girar) {
      giro.current = Math.PI * 2;
      invalidate();
    }
  }, [girar, invalidate]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (destino.current) {
      camera.position.lerp(destino.current, 1 - Math.exp(-3 * d));
      if (camera.position.distanceTo(destino.current) < 0.02) destino.current = null;
      invalidate();
    }
    if (giro.current > 0) {
      const paso = Math.min(giro.current, d * 1.6);
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), paso);
      giro.current -= paso;
      invalidate();
    }
    camera.lookAt(0, 0, 0);
    controls?.update();
  });
  return null;
}

function Captura({ onCaptura }: { onCaptura: Props['onCaptura'] }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onCaptura(() => {
      gl.render(scene, camera); // se lee en el mismo tick, sin preserveDrawingBuffer
      return gl.domElement.toDataURL('image/jpeg', 0.85);
    });
  }, [gl, scene, camera, onCaptura]);
  return null;
}

export default function Escena3D({ escena, girar, onCaptura }: Props) {
  return (
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [9, 9, 11], fov: 35 }} gl={{ antialias: true }}>
      <Ambiente escena={escena} />
      {escena.cajas.map((c) => (
        <Pieza key={c.id} c={c} />
      ))}
      {escena.vista !== 'vacia' && <Cotas escena={escena} />}
      {escena.zonas.map((z, i) => (
        <Html zIndexRange={[20, 0]} key={`${i}-${z.nombre}`} position={[z.x, escena.altura + 0.35, z.z]} center>
          <span className="pointer-events-none whitespace-nowrap rounded-full bg-espresso/85 px-2 py-0.5 text-[10px] text-crema">{z.nombre}</span>
        </Html>
      ))}
      {escena.vista === 'maqueta' && <ContactShadows position={[0, 0.001, 0]} scale={24} blur={2.4} opacity={0.35} far={6} />}
      <OrbitControls makeDefault enablePan={false} minDistance={6} maxDistance={45} maxPolarAngle={Math.PI / 2.15} />
      <Camara escena={escena} girar={girar} />
      <Captura onCaptura={onCaptura} />
    </Canvas>
  );
}
