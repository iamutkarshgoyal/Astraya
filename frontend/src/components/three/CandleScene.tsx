import { useEffect, useMemo, useRef } from 'react';
import {
  ContactShadows,
  Float,
  PresentationControls,
  Sparkles,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import {
  ACESFilmicToneMapping,
  MathUtils,
  PCFShadowMap,
  SRGBColorSpace,
  Vector3,
} from 'three';

import { CandleModel } from '@/components/three/CandleModel';
import { SceneLighting } from '@/components/three/SceneLighting';
import type { CandleSceneProps, FlameEnergy } from '@/components/three/types';

function CameraMotion({
  mobile,
  reducedMotion,
}: Pick<CandleSceneProps, 'mobile' | 'reducedMotion'>) {
  const { camera } = useThree();
  const lookAtTarget = useMemo(() => new Vector3(), []);

  useFrame(({ pointer }, delta) => {
    const scrollProgress = reducedMotion
      ? 0
      : MathUtils.clamp(
          window.scrollY / Math.max(window.innerHeight * 0.92, 1),
          0,
          1,
        );
    const pointerX = reducedMotion ? 0 : pointer.x * (mobile ? 0.04 : 0.12);
    const pointerY = reducedMotion ? 0 : pointer.y * 0.035;
    const targetY = (mobile ? -0.16 : 0.18) + scrollProgress * 0.52 + pointerY;
    const targetZ = (mobile ? 7.65 : 7.35) + scrollProgress * 0.75;

    camera.position.x = MathUtils.damp(camera.position.x, pointerX, 3.2, delta);
    camera.position.y = MathUtils.damp(camera.position.y, targetY, 3.2, delta);
    camera.position.z = MathUtils.damp(camera.position.z, targetZ, 3.2, delta);

    lookAtTarget.set(mobile ? 0.25 : 0.58, mobile ? -0.56 : 0.02, 0);
    camera.lookAt(lookAtTarget);
  });

  return null;
}

function SceneContent({
  compact,
  isLit,
  mobile,
  onToggle,
  reducedMotion,
}: CandleSceneProps) {
  const { size } = useThree();
  const energy = useRef({ value: isLit ? 1 : 0 }) as FlameEnergy;
  const isReducedQuality = compact;
  const useReducedEffects = compact || reducedMotion;
  const shortMobileViewport = mobile && size.height < 700;
  const candleScale = shortMobileViewport ? 0.54 : mobile ? 0.62 : 1.04;
  const candlePosition: [number, number, number] = shortMobileViewport
    ? [0.9, -2.8, 0]
    : mobile
      ? [0.88, -2.55, 0]
      : [2.12, -0.22, 0];
  const floorY = candlePosition[1] - 1.22 * candleScale;

  return (
    <>
      <CameraMotion mobile={mobile} reducedMotion={reducedMotion} />
      <SceneLighting
        candlePosition={candlePosition}
        compact={isReducedQuality}
        energy={energy}
      />

      <Sparkles
        color="#d9bd80"
        count={reducedMotion ? 12 : isReducedQuality ? 18 : 74}
        noise={reducedMotion ? 0 : 0.8}
        opacity={0.34}
        position={[mobile ? 0 : 1.4, mobile ? -0.2 : 0.4, -0.5]}
        scale={[mobile ? 7 : 12, mobile ? 6.5 : 7.5, 6]}
        size={isReducedQuality ? 1.2 : 1.55}
        speed={reducedMotion ? 0 : 0.24}
      />

      <PresentationControls
        cursor
        enabled={!reducedMotion}
        global={false}
        polar={[-0.07, 0.08]}
        rotation={[0, 0, 0]}
        snap
        speed={0.38}
        azimuth={[-0.18, 0.18]}
      >
        <Float
          floatingRange={[-0.045, 0.045]}
          floatIntensity={reducedMotion ? 0 : 0.14}
          rotationIntensity={reducedMotion ? 0 : 0.035}
          speed={reducedMotion ? 0 : 1.05}
        >
          <group position={candlePosition} scale={candleScale}>
            <CandleModel
              compact={isReducedQuality}
              energy={energy}
              isLit={isLit}
              onToggle={onToggle}
              reducedMotion={reducedMotion}
            />
          </group>
        </Float>
      </PresentationControls>

      {!mobile && (
        <>
          <mesh
            receiveShadow
            position={[candlePosition[0], floorY - 0.035, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial
              color="#07111f"
              metalness={isReducedQuality ? 0.08 : 0.32}
              roughness={isReducedQuality ? 0.68 : 0.4}
            />
          </mesh>
          {isReducedQuality ? (
            <mesh
              position={[candlePosition[0], floorY + 0.006, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[1.9, 1.15, 1]}
            >
              <circleGeometry args={[1, 32]} />
              <meshBasicMaterial
                color="#010309"
                depthWrite={false}
                opacity={0.34}
                transparent
              />
            </mesh>
          ) : (
            <ContactShadows
              blur={3}
              color="#010309"
              far={4}
              frames={1}
              opacity={0.62}
              position={[candlePosition[0], floorY, 0]}
              resolution={256}
              scale={5.5}
            />
          )}
        </>
      )}

      {!useReducedEffects ? (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.05}
            luminanceSmoothing={0.22}
            luminanceThreshold={0.82}
            mipmapBlur
            resolutionScale={0.55}
          />
          <DepthOfField
            bokehScale={0.9}
            resolutionScale={0.55}
            target={[candlePosition[0], candlePosition[1] + 0.15, 0]}
            worldFocusRange={3.2}
          />
          <Vignette darkness={0.34} offset={0.34} />
        </EffectComposer>
      ) : !compact ? (
        <EffectComposer multisampling={0} resolutionScale={0.75}>
          <Bloom
            intensity={0.7}
            luminanceSmoothing={0.22}
            luminanceThreshold={0.82}
            mipmapBlur
          />
          <Vignette darkness={0.34} offset={0.34} />
        </EffectComposer>
      ) : null}
    </>
  );
}

function ContextLossGuard({
  onContextLost,
}: Pick<CandleSceneProps, 'onContextLost'>) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener('webglcontextlost', handleContextLoss);
    return () =>
      canvas.removeEventListener('webglcontextlost', handleContextLoss);
  }, [gl, onContextLost]);

  return null;
}

export function CandleScene(props: CandleSceneProps) {
  return (
    <Canvas
      camera={{
        fov: props.mobile ? 42 : 38,
        near: 0.1,
        far: 40,
        position: [0, props.mobile ? -0.16 : 0.18, props.mobile ? 7.65 : 7.35],
      }}
      dpr={[1, props.compact ? 1.2 : 1.35]}
      frameloop={props.active ? 'always' : 'never'}
      gl={{
        alpha: true,
        antialias: !props.compact,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      shadows={!props.compact}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.shadowMap.type = PCFShadowMap;
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = true;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.setClearColor(0x071326, 0);
      }}
    >
      <ContextLossGuard onContextLost={props.onContextLost} />
      <SceneContent {...props} />
    </Canvas>
  );
}

export default CandleScene;
