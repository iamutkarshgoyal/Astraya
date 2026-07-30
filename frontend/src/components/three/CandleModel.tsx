import { useEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  DataTexture,
  DoubleSide,
  LinearFilter,
  RedFormat,
  RepeatWrapping,
  SRGBColorSpace,
  type PointLight,
  UnsignedByteType,
} from 'three';

import { Flame } from '@/components/three/Flame';
import { SmokeParticles } from '@/components/three/SmokeParticles';
import type { FlameEnergy } from '@/components/three/types';

const petalAngles = Array.from({ length: 10 }, (_, index) => (index / 10) * Math.PI * 2);

function createWaxTexture() {
  const size = 64;
  const data = new Uint8Array(size * size);
  let seed = 29;

  for (let index = 0; index < data.length; index += 1) {
    seed = (seed * 16807) % 2147483647;
    data[index] = 108 + (seed % 42);
  }

  const texture = new DataTexture(data, size, size, RedFormat, UnsignedByteType);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.needsUpdate = true;
  return texture;
}

type CandleModelProps = {
  compact: boolean;
  energy: FlameEnergy;
  isLit: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
};

export function CandleModel({
  compact,
  energy,
  isLit,
  onToggle,
  reducedMotion,
}: CandleModelProps) {
  const flameLightRef = useRef<PointLight>(null);
  const logoTexture = useTexture('/assets/astraya/logo/astraya-logo.jpg');
  const waxTexture = useMemo(createWaxTexture, []);

  useEffect(() => {
    logoTexture.colorSpace = SRGBColorSpace;
    logoTexture.anisotropy = compact ? 2 : 4;
    logoTexture.needsUpdate = true;
  }, [compact, logoTexture]);

  useEffect(() => () => waxTexture.dispose(), [waxTexture]);

  useFrame(({ clock }) => {
    if (!flameLightRef.current) {
      return;
    }
    const flicker = reducedMotion
      ? 1
      : 0.96 +
        Math.sin(clock.elapsedTime * 9.7) * 0.035 +
        Math.sin(clock.elapsedTime * 16.1) * 0.018;
    flameLightRef.current.intensity = energy.current.value * (compact ? 6.8 : 9.5) * flicker;
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -0.14, 0]}>
        <cylinderGeometry args={[1.04, 1.055, 2.02, compact ? 40 : 96]} />
        <meshStandardMaterial
          bumpMap={waxTexture}
          bumpScale={0.025}
          color="#efe3c9"
          metalness={0}
          roughness={0.72}
        />
      </mesh>

      <mesh castShadow position={[0, 0.88, 0]}>
        <cylinderGeometry args={[1.04, 1.04, 0.08, compact ? 40 : 96]} />
        <meshPhysicalMaterial
          bumpMap={waxTexture}
          bumpScale={0.018}
          clearcoat={0.18}
          clearcoatRoughness={0.42}
          color="#f5ead2"
          roughness={0.54}
        />
      </mesh>

      <mesh position={[0, 0.932, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.47, compact ? 32 : 64]} />
        <meshPhysicalMaterial
          clearcoat={0.62}
          clearcoatRoughness={0.22}
          color="#eadbb9"
          roughness={0.28}
        />
      </mesh>

      {petalAngles.map((angle) => (
        <mesh
          key={angle}
          castShadow
          position={[Math.cos(angle) * 0.4, 0.982, Math.sin(angle) * 0.4]}
          rotation={[0, -angle, 0]}
          scale={[0.23, 0.065, 0.115]}
        >
          <sphereGeometry args={[1, compact ? 12 : 18, compact ? 8 : 12]} />
          <meshStandardMaterial color="#f6eddb" roughness={0.62} />
        </mesh>
      ))}

      <mesh castShadow position={[0, 1.01, 0]} scale={[0.17, 0.055, 0.17]}>
        <sphereGeometry args={[1, compact ? 14 : 22, compact ? 10 : 16]} />
        <meshStandardMaterial color="#cda458" roughness={0.58} />
      </mesh>

      <mesh castShadow position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.4, 12]} />
        <meshStandardMaterial color="#32251d" roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[1.13, 1.13, 2.46, compact ? 40 : 96, 1, true]} />
        <meshPhysicalMaterial
          attenuationColor="#edf6f4"
          attenuationDistance={2.4}
          clearcoat={0.8}
          clearcoatRoughness={0.08}
          color="#e7f0ee"
          depthWrite={false}
          envMapIntensity={1.9}
          ior={1.5}
          opacity={compact ? 0.24 : 0.32}
          roughness={compact ? 0.11 : 0.055}
          side={DoubleSide}
          thickness={0.1}
          transmission={compact ? 0 : 0.9}
          transparent
        />
      </mesh>

      <mesh castShadow position={[0, -1.2, 0]}>
        <cylinderGeometry args={[1.13, 1.13, 0.1, compact ? 40 : 96]} />
        <meshPhysicalMaterial
          clearcoat={0.72}
          color="#d8e5e3"
          depthWrite={false}
          envMapIntensity={1.8}
          opacity={compact ? 0.3 : 0.4}
          roughness={0.1}
          thickness={0.18}
          transmission={compact ? 0 : 0.88}
          transparent
        />
      </mesh>

      <mesh position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.115, 0.038, 12, compact ? 40 : 96]} />
        <meshPhysicalMaterial
          clearcoat={0.9}
          color="#f1f7f5"
          depthWrite={false}
          envMapIntensity={2}
          opacity={0.68}
          roughness={0.08}
          transmission={compact ? 0 : 0.72}
          transparent
        />
      </mesh>

      <mesh castShadow position={[0, -0.22, 1.146]}>
        <planeGeometry args={[0.92, 0.92]} />
        <meshPhysicalMaterial
          clearcoat={0.28}
          clearcoatRoughness={0.32}
          map={logoTexture}
          metalness={0.02}
          roughness={0.48}
        />
      </mesh>

      <pointLight
        ref={flameLightRef}
        color="#ffb85c"
        decay={2}
        distance={7}
        intensity={isLit ? 8 : 0}
        position={[0, 1.62, 0.28]}
      />

      <Flame
        energy={energy}
        isLit={isLit}
        onToggle={onToggle}
        reducedMotion={reducedMotion}
      />
      {!isLit && (
        <SmokeParticles compact={compact} reducedMotion={reducedMotion} />
      )}
    </group>
  );
}
