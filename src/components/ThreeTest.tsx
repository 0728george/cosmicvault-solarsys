import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

// Planet data (relative sizes and orbit radii – scaled for visibility)
const planets = [
  { name: 'Sun', radius: 2, distance: 0, color: '#FDB813', emissive: '#FDB813' },
  { name: 'Mercury', radius: 0.2, distance: 4, color: '#8C8C8C' },
  { name: 'Venus', radius: 0.5, distance: 6, color: '#D8CA9D' },
  { name: 'Earth', radius: 0.5, distance: 8, color: '#5B8CFF' },
  { name: 'Mars', radius: 0.3, distance: 10, color: '#CD5C5C' },
  { name: 'Jupiter', radius: 1.2, distance: 14, color: '#D8A657' },
  { name: 'Saturn', radius: 1.0, distance: 18, color: '#E3CD9A' },
  { name: 'Uranus', radius: 0.7, distance: 22, color: '#D3F5F9' },
  { name: 'Neptune', radius: 0.7, distance: 26, color: '#5B6EE1' },
];

function Planet({ name, radius, distance, color, emissive }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      // Orbital motion (different speeds)
      const speed = 0.2 / (distance || 1);
      ref.current.position.x = Math.cos(state.clock.elapsedTime * speed) * distance;
      ref.current.position.z = Math.sin(state.clock.elapsedTime * speed) * distance;
    }
  });

  return (
    <group>
      {/* Orbit path */}
      {distance > 0 && (
        <line>
          <ringGeometry args={[distance - 0.05, distance + 0.05, 64]} />
          <lineBasicMaterial color="#444466" opacity={0.3} transparent />
        </line>
      )}

      {/* Planet */}
      <mesh
        ref={ref}
        position={[distance, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive || '#000000'}
          emissiveIntensity={name === 'Sun' ? 2 : 0.2}
        />

        {/* Label */}
        {hovered && (
          <Text
            position={[0, radius + 1, 0]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {name}
          </Text>
        )}
      </mesh>
    </group>
  );
}

// Saturn's rings
function SaturnRings() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.2, 1.8, 64]} />
      <meshBasicMaterial color="#E3CD9A" side={THREE.DoubleSide} opacity={0.7} transparent />
    </mesh>
  );
}

export default function ThreeTest() {
  return (
    <Canvas camera={{ position: [0, 20, 30], fov: 60 }}>
      {/* Deep space background */}
      <color attach="background" args={['#000011']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" /> {/* Sun light */}

      {/* Planets */}
      {planets.map((p) => (
        <Planet key={p.name} {...p} />
      ))}

      {/* Special: Saturn rings */}
      <group position={[0, 0, 0]}>
        <SaturnRings />
      </group>

      {/* Controls */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={60}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}