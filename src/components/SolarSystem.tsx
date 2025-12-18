import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, useTexture } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';

const SCALE_DIST = 350;
const SCALE_RADIUS = 20;

const LOD_MED_MULTIPLIER = 150;
const LOD_HIGH_MULTIPLIER = 80;

const bodies = [
  // ... (keep your full bodies array with Pluto included and your exact paths)
];

function BodyInner({ data, date }: { data: any; date: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Load textures – they will be null until loaded
  const lowMap = useTexture(data.textureLow) as THREE.Texture;
  const medMap = useTexture(data.textureMed || data.textureLow) as THREE.Texture;
  const highMap = useTexture(data.textureHigh) as THREE.Texture;

  const lowClouds = data.cloudsLow ? useTexture(data.cloudsLow) as THREE.Texture : null;
  const medClouds = data.cloudsMed ? useTexture(data.cloudsMed || data.cloudsLow) as THREE.Texture : null;
  const highClouds = data.cloudsHigh ? useTexture(data.cloudsHigh) as THREE.Texture : null;

  const lowRing = data.ringLow ? useTexture(data.ringLow) as THREE.Texture : null;
  const medRing = data.ringMed ? useTexture(data.ringMed || data.ringLow) as THREE.Texture : null;
  const highRing = data.ringHigh ? useTexture(data.ringHigh) as THREE.Texture : null;

  const [currentMap, setCurrentMap] = useState<THREE.Texture | null>(null);
  const [currentClouds, setCurrentClouds] = useState<THREE.Texture | null>(null);
  const [currentRing, setCurrentRing] = useState<THREE.Texture | null>(null);

  // Start with low-res once loaded
  useState(() => {
    setCurrentMap(lowMap);
    setCurrentClouds(lowClouds);
    setCurrentRing(lowRing);
  });

  // Orbital position
  const epoch = new Date('2000-01-01');
  const days = (new Date(date) - epoch) / 86400000;
  const angle = data.period ? (days / data.period) * Math.PI * 2 + (data.initialAngle || 0) : 0;
  const posX = data.dist * SCALE_DIST * Math.cos(angle);
  const posZ = data.dist * SCALE_DIST * Math.sin(angle);

  useFrame(() => {
    if (groupRef.current && camera) {
      const distance = camera.position.distanceTo(groupRef.current.position);
      const medThreshold = data.radius * LOD_MED_MULTIPLIER;
      const highThreshold = data.radius * LOD_HIGH_MULTIPLIER;

      if (distance < highThreshold) {
        setCurrentMap(highMap);
        if (highClouds) setCurrentClouds(highClouds);
        if (highRing) setCurrentRing(highRing);
      } else if (distance < medThreshold) {
        setCurrentMap(medMap);
        if (medClouds) setCurrentClouds(medClouds);
        if (medRing) setCurrentRing(medRing);
      } else {
        setCurrentMap(lowMap);
        if (lowClouds) setCurrentClouds(lowClouds);
        if (lowRing) setCurrentRing(lowRing);
      }
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += (data.rotSpeed || 0.001) * (data.rotDir || 1);
    }
  });

  // If no texture yet, fallback material
  if (!currentMap) {
    return (
      <group ref={groupRef} position={[posX, 0, posZ]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[data.radius, 32, 32]} />
          <meshBasicMaterial color={data.emissive ? '#ffaa00' : '#555555'} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[posX, 0, posZ]}>
      {data.dist > 0 && (
        <line>
          <ringGeometry args={[data.dist * SCALE_DIST * 0.99, data.dist * SCALE_DIST * 1.01, 128]} />
          <lineBasicMaterial color="#334455" transparent opacity={0.4} />
        </line>
      )}

      <mesh
        ref={meshRef}
        rotation={[ (data.tilt || 0) * Math.PI / 180, 0, 0 ]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        <meshStandardMaterial
          map={currentMap}
          emissive={data.emissive ? '#ffaa00' : '#000000'}
          emissiveIntensity={data.emissive ? 3 : 0}
          roughness={0.8}
          metalness={0}
        />

        {currentClouds && (
          <mesh scale={1.01}>
            <sphereGeometry args={[data.radius, 64, 64]} />
            <meshStandardMaterial map={currentClouds} transparent opacity={0.4} depthWrite={false} />
          </mesh>
        )}

        {currentRing && (
          <mesh rotation={[Math.PI / 2 + (data.tilt || 0) * Math.PI / 180, 0, 0.15]}>
            <ringGeometry args={[data.radius * 1.2, data.radius * 2.8, 64]} />
            <meshBasicMaterial map={currentRing} side={THREE.DoubleSide} transparent />
          </mesh>
        )}
      </mesh>

      {hovered && (
        <Text
          position={[0, data.radius + 15, 0]}
          fontSize={20}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          onUpdate={(self) => self.quaternion.copy(camera.quaternion)}
        >
          {data.name}
        </Text>
      )}

      {data.moons?.map((moon: any, i: number) => (
        <BodyInner key={i} data={moon} date={date} />
      ))}
    </group>
  );
}

function Body({ data, date }: { data: any; date: string }) {
  return (
    <Suspense fallback={
      <mesh>
        <sphereGeometry args={[data.radius, 32, 32]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
    }>
      <BodyInner data={data} date={date} />
    </Suspense>
  );
}

export default function SolarSystem({ date = '2025-12-18' }: { date?: string }) {
  return (
    <Canvas camera={{ position: [0, 600, 2200], fov: 60 }}>
      <color attach="background" args={['#000011']} />
      <fog attach="fog" args={['#000011', 1000, 10000]} />

      <Stars radius={10000} depth={50} count={20000} factor={6} saturation={0} fade speed={1} />

      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffffff" distance={0} decay={2} />

      {bodies.map((b, i) => (
        <Body key={i} data={b} date={date} />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.2}
        minDistance={200}
        maxDistance={8000}
      />
    </Canvas>
  );
}