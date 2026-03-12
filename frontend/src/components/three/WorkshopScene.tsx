"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Center,
  Float,
  MeshReflectorMaterial,
  Sparkles,
  ContactShadows,
  Text,
} from "@react-three/drei";
import { Suspense, useState, useRef, useMemo } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Keycap                                                             */
/* ------------------------------------------------------------------ */
function Keycap({
  position,
  color,
  accentColor,
  scale = 1,
  onClick,
}: {
  position: [number, number, number];
  color: string;
  accentColor?: string;
  scale?: number;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = hovered ? 0.12 : 0;
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      target,
      delta * 8
    );
  });

  const baseColor = accentColor ?? color;

  return (
    <group position={position} scale={scale}>
      <group ref={meshRef}>
        {/* Keycap body */}
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          castShadow
        >
          <boxGeometry args={[0.8, 0.4, 0.8]} />
          <meshStandardMaterial
            color={hovered ? "#a78bfa" : baseColor}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        {/* Keycap top dish */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.65, 0.05, 0.65]} />
          <meshStandardMaterial
            color={hovered ? "#c4b5fd" : baseColor}
            roughness={0.2}
            metalness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Keyboard                                                           */
/* ------------------------------------------------------------------ */
function Keyboard({ position }: { position: [number, number, number] }) {
  const rows = useMemo(
    () => [
      { count: 10, offset: 0, color: "#404040" },
      { count: 10, offset: 0.2, color: "#4a4a4a" },
      { count: 9, offset: 0.4, color: "#454545" },
      { count: 7, offset: 1.0, color: "#404040" },
    ],
    []
  );

  return (
    <group position={position} rotation={[-0.1, 0, 0]}>
      {/* Keyboard case */}
      <mesh position={[0, -0.15, 0.3]} receiveShadow castShadow>
        <boxGeometry args={[10, 0.3, 5]} />
        <meshStandardMaterial
          color="#1e1e1e"
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      {/* Plate accent strip */}
      <mesh position={[0, 0.01, -2.2]} receiveShadow>
        <boxGeometry args={[10, 0.04, 0.15]} />
        <meshStandardMaterial
          color="#8b5cf6"
          roughness={0.3}
          metalness={0.6}
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Keycaps */}
      {rows.map((row, rowIndex) =>
        Array.from({ length: row.count }).map((_, colIndex) => {
          const isAccent =
            (rowIndex === 0 && colIndex === 9) || // Esc-ish
            (rowIndex === 3 && colIndex === 3); // spacebar area
          return (
            <Keycap
              key={`${rowIndex}-${colIndex}`}
              position={[
                colIndex * 0.95 - (row.count * 0.95) / 2 + 0.5 + row.offset,
                0.15 + rowIndex * 0.05,
                rowIndex * 0.95 - 1.2,
              ]}
              color={row.color}
              accentColor={isAccent ? "#8b5cf6" : undefined}
            />
          );
        })
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Mechanical Switch cross-section                                    */
/* ------------------------------------------------------------------ */
function SwitchModel({
  position,
  stemColor = "#8b5cf6",
}: {
  position: [number, number, number];
  stemColor?: string;
}) {
  const stemRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!stemRef.current) return;
    // gentle bob to simulate keypress
    stemRef.current.position.y =
      0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
  });

  return (
    <group position={position} scale={1.4}>
      {/* Housing bottom */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {/* Housing top (transparent) */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.4}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Stem (cross shape simulated with two intersecting boxes) */}
      <mesh ref={stemRef} position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.7, 0.4]} />
        <meshStandardMaterial
          color={stemColor}
          roughness={0.3}
          metalness={0.4}
          emissive={stemColor}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.7, 0.12]} />
        <meshStandardMaterial
          color={stemColor}
          roughness={0.3}
          metalness={0.4}
          emissive={stemColor}
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Spring */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, -0.05 + i * 0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.2, 0.015, 6, 24]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>
      ))}
      {/* Contact leaves */}
      <mesh position={[0.3, -0.15, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.08]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.2}
          metalness={0.95}
        />
      </mesh>
      <mesh position={[-0.3, -0.15, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.08]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.2}
          metalness={0.95}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Title Text                                                */
/* ------------------------------------------------------------------ */
function FloatingTitle() {
  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
      <Center position={[0, 4.2, -3]}>
        <Text
          fontSize={1.1}
          color="#8b5cf6"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
          letterSpacing={0.05}
          maxWidth={10}
        >
          THE MECHANICAL WORKSHOP
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.5}
          />
        </Text>
      </Center>
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/*  Ambient particles ring                                             */
/* ------------------------------------------------------------------ */
function ParticleRing() {
  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  const positions = useMemo(() => {
    const pts = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const angle = (i / 200) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      pts[i * 3] = Math.cos(angle) * radius;
      pts[i * 3 + 1] = Math.random() * 5 - 0.5;
      pts[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pts;
  }, []);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6d28d9"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene composition                                                  */
/* ------------------------------------------------------------------ */
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-4, 3, -3]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[4, 2, 3]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[0, 1, 5]} intensity={0.2} color="#f59e0b" />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Main keyboard */}
      <Keyboard position={[0, 0.5, 0]} />

      {/* Floating switch models */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <SwitchModel position={[-5, 2.8, -1]} stemColor="#8b5cf6" />
      </Float>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <SwitchModel position={[5, 2.2, 1]} stemColor="#06b6d4" />
      </Float>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.7}>
        <SwitchModel position={[0, 3.5, -4]} stemColor="#f59e0b" />
      </Float>

      {/* Title */}
      <FloatingTitle />

      {/* Reflective floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={25}
          roughness={0.85}
          depthScale={1.2}
          color="#080808"
          metalness={0.5}
          mirror={0.35}
        />
      </mesh>

      {/* Sparkles */}
      <Sparkles
        count={80}
        scale={18}
        size={2}
        speed={0.3}
        color="#8b5cf6"
      />
      <Sparkles
        count={40}
        scale={12}
        size={1.2}
        speed={0.2}
        color="#06b6d4"
      />

      {/* Particle ring */}
      <ParticleRing />

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={25}
        blur={2.5}
        far={4}
      />

      {/* Environment */}
      <Environment preset="night" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Canvas                                                    */
/* ------------------------------------------------------------------ */
export default function WorkshopScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 5, 8], fov: 45 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
