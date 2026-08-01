import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CanvasTexture,
  DataTexture,
  DoubleSide,
  ExtrudeGeometry,
  LinearFilter,
  RedFormat,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
  type PointLight,
  UnsignedByteType,
} from 'three';

import { Flame } from '@/components/three/Flame';
import { SmokeParticles } from '@/components/three/SmokeParticles';
import type { FlameEnergy } from '@/components/three/types';
import type { CandleVisual } from '@/types/customization';

const ringAngles = Array.from({ length: 9 }, (_, index) => (index / 9) * Math.PI * 2);
const glitterPositions = Array.from({ length: 18 }, (_, index) => {
  const angle = index * 2.39996;
  const radius = 0.18 + ((index * 19) % 52) / 100;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
});

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

function createHeartGeometry() {
  const shape = new Shape();
  shape.moveTo(0, -0.34);
  shape.bezierCurveTo(-0.08, -0.22, -0.48, 0.02, -0.48, 0.3);
  shape.bezierCurveTo(-0.48, 0.62, -0.08, 0.72, 0, 0.43);
  shape.bezierCurveTo(0.08, 0.72, 0.48, 0.62, 0.48, 0.3);
  shape.bezierCurveTo(0.48, 0.02, 0.08, -0.22, 0, -0.34);
  const geometry = new ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.06,
    bevelThickness: 0.05,
    curveSegments: 12,
    depth: 0.16,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

function createLabelTexture(label: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#f5efe3';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#ad8848';
    context.lineWidth = 7;
    context.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
    context.fillStyle = '#17243a';
    context.font = '600 52px Georgia';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, canvas.width / 2, 190, 540);
    context.fillStyle = '#8c6a38';
    context.font = '600 24px Arial';
    context.fillText('HAND-POURED SOY CANDLE', canvas.width / 2, 268);
    context.fillStyle = '#6f675d';
    context.font = '20px Arial';
    context.fillText('SMALL BATCH  ·  INDIA', canvas.width / 2, 315);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

type CandleDecorationsProps = {
  compact: boolean;
  visual: CandleVisual;
};

function CandleDecorations({ compact, visual }: CandleDecorationsProps) {
  const heartGeometry = useMemo(createHeartGeometry, []);

  useEffect(() => () => heartGeometry.dispose(), [heartGeometry]);

  if (visual.decoration === 'none') {
    return visual.glitter ? (
      <Glitter compact={compact} color={visual.decorationColor} />
    ) : null;
  }

  return (
    <group>
      {visual.decoration === 'hearts' &&
        ringAngles.map((angle) => (
          <mesh
            key={angle}
            castShadow
            geometry={heartGeometry}
            position={[Math.cos(angle) * 0.56, 0.985, Math.sin(angle) * 0.56]}
            rotation={[Math.PI / 2, 0, -angle - Math.PI / 2]}
            scale={0.25}
          >
            <meshPhysicalMaterial
              clearcoat={0.42}
              clearcoatRoughness={0.28}
              color={visual.decorationColor}
              roughness={0.5}
            />
          </mesh>
        ))}

      {visual.decoration === 'daisy' && (
        <>
          {ringAngles.map((angle) => (
            <mesh
              key={angle}
              castShadow
              position={[Math.cos(angle) * 0.36, 0.995, Math.sin(angle) * 0.36]}
              rotation={[0, -angle, 0]}
              scale={[0.27, 0.07, 0.13]}
            >
              <sphereGeometry args={[1, compact ? 12 : 20, compact ? 8 : 14]} />
              <meshPhysicalMaterial
                clearcoat={0.22}
                color={visual.decorationColor}
                roughness={0.58}
              />
            </mesh>
          ))}
          <mesh castShadow position={[0, 1.015, 0]} scale={[0.18, 0.07, 0.18]}>
            <sphereGeometry args={[1, compact ? 14 : 22, compact ? 10 : 16]} />
            <meshStandardMaterial color="#c69a43" roughness={0.62} />
          </mesh>
        </>
      )}

      {visual.decoration === 'rose' && (
        <group position={[0, 1.01, 0]}>
          {Array.from({ length: compact ? 12 : 18 }, (_, index) => {
            const ring = index < 6 ? 0.18 : index < 12 ? 0.35 : 0.5;
            const angle = index * 2.18;
            return (
              <mesh
                key={index}
                castShadow
                position={[Math.cos(angle) * ring, 0, Math.sin(angle) * ring]}
                rotation={[0.18, -angle, 0.12]}
                scale={[0.2, 0.065, 0.11]}
              >
                <sphereGeometry args={[1, compact ? 10 : 16, compact ? 8 : 12]} />
                <meshPhysicalMaterial
                  clearcoat={0.3}
                  color={visual.decorationColor}
                  roughness={0.52}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {visual.decoration === 'petals' &&
        ringAngles.slice(0, 7).map((angle, index) => (
          <mesh
            key={angle}
            castShadow
            position={[
              Math.cos(angle) * (0.28 + (index % 2) * 0.18),
              0.985,
              Math.sin(angle) * (0.28 + (index % 2) * 0.18),
            ]}
            rotation={[0.08, -angle, 0.18]}
            scale={[0.2, 0.055, 0.095]}
          >
            <sphereGeometry args={[1, compact ? 10 : 16, compact ? 8 : 12]} />
            <meshPhysicalMaterial
              clearcoat={0.25}
              color={visual.decorationColor}
              roughness={0.58}
            />
          </mesh>
        ))}

      {visual.glitter && <Glitter compact={compact} color="#d7b25f" />}
    </group>
  );
}

function Glitter({ color, compact }: { color: string; compact: boolean }) {
  return (
    <group>
      {glitterPositions.slice(0, compact ? 9 : undefined).map(([x, z], index) => (
        <mesh key={`${x}-${z}`} position={[x, 1.035 + (index % 3) * 0.003, z]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.24}
            metalness={0.76}
            roughness={0.24}
          />
        </mesh>
      ))}
    </group>
  );
}

export type CandleModelProps = {
  compact: boolean;
  energy: FlameEnergy;
  isLit: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
  visual: CandleVisual;
};

export function CandleModel({
  compact,
  energy,
  isLit,
  onToggle,
  reducedMotion,
  visual,
}: CandleModelProps) {
  const flameLightRef = useRef<PointLight>(null);
  const waxTexture = useMemo(createWaxTexture, []);
  const labelTexture = useMemo(() => createLabelTexture(visual.label), [visual.label]);

  useEffect(() => () => labelTexture.dispose(), [labelTexture]);
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
    flameLightRef.current.intensity =
      energy.current.value * (compact ? 7.2 : 10.2) * flicker;
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -0.14, 0]}>
        <cylinderGeometry args={[1.02, 1.035, 2.02, compact ? 40 : 96]} />
        <meshPhysicalMaterial
          bumpMap={waxTexture}
          bumpScale={0.022}
          clearcoat={0.12}
          clearcoatRoughness={0.62}
          color={visual.waxColor}
          roughness={0.7}
        />
      </mesh>

      <mesh castShadow position={[0, 0.88, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.075, compact ? 40 : 96]} />
        <meshPhysicalMaterial
          bumpMap={waxTexture}
          bumpScale={0.014}
          clearcoat={0.34}
          clearcoatRoughness={0.32}
          color={visual.waxColor}
          roughness={0.48}
        />
      </mesh>

      <mesh position={[0, 0.923, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.93, compact ? 40 : 96]} />
        <meshPhysicalMaterial
          clearcoat={0.44}
          clearcoatRoughness={0.24}
          color={visual.waxColor}
          roughness={0.4}
        />
      </mesh>

      <CandleDecorations compact={compact} visual={visual} />

      <mesh castShadow position={[0, 1.16, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.42, 12]} />
        <meshStandardMaterial color="#2f251f" roughness={0.94} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[1.14, 1.14, 2.48, compact ? 48 : 112, 1, true]} />
        <meshPhysicalMaterial
          attenuationColor={visual.vesselColor}
          attenuationDistance={2.2}
          clearcoat={0.95}
          clearcoatRoughness={0.055}
          color={visual.vesselColor}
          depthWrite={false}
          envMapIntensity={2.1}
          ior={1.51}
          opacity={compact ? 0.22 : 0.3}
          roughness={compact ? 0.12 : 0.04}
          side={DoubleSide}
          thickness={0.12}
          transmission={compact ? 0 : 0.94}
          transparent
        />
      </mesh>

      <mesh castShadow position={[0, -1.205, 0]}>
        <cylinderGeometry args={[1.14, 1.14, 0.1, compact ? 48 : 112]} />
        <meshPhysicalMaterial
          clearcoat={0.92}
          color={visual.vesselColor}
          depthWrite={false}
          envMapIntensity={2}
          opacity={compact ? 0.34 : 0.44}
          roughness={0.08}
          thickness={0.2}
          transmission={compact ? 0 : 0.9}
          transparent
        />
      </mesh>

      <mesh position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.125, 0.04, 14, compact ? 48 : 112]} />
        <meshPhysicalMaterial
          clearcoat={1}
          color="#f5faf8"
          depthWrite={false}
          envMapIntensity={2.2}
          opacity={0.72}
          roughness={0.06}
          transmission={compact ? 0 : 0.82}
          transparent
        />
      </mesh>

      <mesh castShadow position={[0, -0.28, 1.148]}>
        <planeGeometry args={[1.18, 0.84]} />
        <meshPhysicalMaterial
          clearcoat={0.22}
          clearcoatRoughness={0.38}
          map={labelTexture}
          roughness={0.5}
        />
      </mesh>

      <pointLight
        ref={flameLightRef}
        color="#ffb45a"
        decay={2}
        distance={7.5}
        intensity={isLit ? 8 : 0}
        position={[0, 1.68, 0.28]}
      />

      <Flame
        energy={energy}
        isLit={isLit}
        onToggle={onToggle}
        reducedMotion={reducedMotion}
      />
      {!isLit && <SmokeParticles compact={compact} reducedMotion={reducedMotion} />}
    </group>
  );
}
