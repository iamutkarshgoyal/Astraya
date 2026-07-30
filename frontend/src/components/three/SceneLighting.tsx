import { useRef } from 'react';
import { Environment, Lightformer, SpotLight } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  MathUtils,
  type AmbientLight,
  type DirectionalLight,
  type HemisphereLight,
  type SpotLight as ThreeSpotLight,
} from 'three';

import type { FlameEnergy } from '@/components/three/types';

type SceneLightingProps = {
  candlePosition: [number, number, number];
  compact: boolean;
  energy: FlameEnergy;
};

export function SceneLighting({
  candlePosition,
  compact,
  energy,
}: SceneLightingProps) {
  const ambientRef = useRef<AmbientLight>(null);
  const keyLightRef = useRef<DirectionalLight>(null);
  const skyLightRef = useRef<HemisphereLight>(null);
  const volumetricRef = useRef<ThreeSpotLight>(null);

  useFrame((_, delta) => {
    const flameEnergy = energy.current.value;
    if (ambientRef.current) {
      ambientRef.current.intensity = MathUtils.damp(
        ambientRef.current.intensity,
        0.18 + flameEnergy * 0.18,
        5,
        delta,
      );
    }
    if (skyLightRef.current) {
      skyLightRef.current.intensity = MathUtils.damp(
        skyLightRef.current.intensity,
        0.34 + flameEnergy * 0.18,
        5,
        delta,
      );
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = MathUtils.damp(
        keyLightRef.current.intensity,
        1.1 + flameEnergy * 0.35,
        5,
        delta,
      );
    }
    if (volumetricRef.current) {
      volumetricRef.current.intensity = MathUtils.damp(
        volumetricRef.current.intensity,
        0.65 + flameEnergy * 1.45,
        5,
        delta,
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} color="#91a1b8" intensity={0.35} />
      <hemisphereLight
        ref={skyLightRef}
        args={['#b5cce0', '#05070c', 0.5]}
      />
      <directionalLight
        ref={keyLightRef}
        castShadow={!compact}
        color="#ffe6b8"
        intensity={1.4}
        position={[-3.5, 5.5, 4]}
        shadow-bias={-0.00025}
        shadow-camera-bottom={-5}
        shadow-camera-far={14}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-mapSize-height={compact ? 512 : 1024}
        shadow-mapSize-width={compact ? 512 : 1024}
      />
      {compact ? (
        <spotLight
          ref={volumetricRef}
          angle={0.42}
          color="#e7bd72"
          decay={2}
          distance={10}
          intensity={2}
          penumbra={0.92}
          position={[candlePosition[0] - 0.8, 5.2, 3.2]}
        />
      ) : (
        <SpotLight
          ref={volumetricRef}
          angle={0.42}
          anglePower={5}
          attenuation={4.5}
          color="#e7bd72"
          distance={10}
          intensity={2}
          opacity={0.075}
          penumbra={0.92}
          position={[candlePosition[0] - 0.8, 5.2, 3.2]}
          radiusBottom={1.9}
          radiusTop={0.08}
          volumetric
        />
      )}

      {!compact && (
        <Environment frames={1} resolution={128}>
          <Lightformer
            color="#f7dca9"
            form="ring"
            intensity={2.4}
            position={[candlePosition[0] - 1.5, 4, -3]}
            scale={2.4}
            target={candlePosition}
          />
          <Lightformer
            color="#9ebdc6"
            form="rect"
            intensity={1.8}
            position={[candlePosition[0] + 4, 1, 1]}
            scale={[3, 1.5]}
            target={candlePosition}
          />
          <Lightformer
            color="#d89e8f"
            form="circle"
            intensity={1.3}
            position={[candlePosition[0] - 3.5, -0.5, 2]}
            scale={1.5}
            target={candlePosition}
          />
        </Environment>
      )}
    </>
  );
}
