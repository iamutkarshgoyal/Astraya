import {
  Component,
  forwardRef,
  type ErrorInfo,
  type PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  PresentationControls,
  Sparkles,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import {
  ACESFilmicToneMapping,
  MathUtils,
  PCFShadowMap,
  SRGBColorSpace,
  type Group,
} from 'three';

import { CandleModel } from '@/components/three/CandleModel';
import { SceneLighting } from '@/components/three/SceneLighting';
import type { DeviceTiltRef, FlameEnergy } from '@/components/three/types';
import type { CandleVisual } from '@/types/customization';
import { cn } from '@/utils/cn';

export type ProductViewerHandle = {
  capturePreview: () => string | null;
};

type ProductViewer3DProps = {
  active?: boolean;
  className?: string;
  compact?: boolean;
  fallbackImage?: string | null;
  isLit: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
  tiltRef: DeviceTiltRef;
  visual: CandleVisual;
};

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const preferredContext =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    const context =
      preferredContext ??
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

class ViewerBoundary extends Component<
  PropsWithChildren<{ fallback: React.ReactNode }>,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Astraya product viewer could not load.', error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function TiltGroup({
  children,
  reducedMotion,
  tiltRef,
}: PropsWithChildren<{
  reducedMotion: boolean;
  tiltRef: DeviceTiltRef;
}>) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }
    const tilt = tiltRef.current;
    const targetX = reducedMotion || !tilt.active ? 0 : tilt.y * 0.24;
    const targetY = reducedMotion || !tilt.active ? 0 : tilt.x * 0.4;
    groupRef.current.rotation.x = MathUtils.damp(
      groupRef.current.rotation.x,
      targetX,
      4,
      delta,
    );
    groupRef.current.rotation.y = MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      4,
      delta,
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

function ViewerContent({
  compact = false,
  isLit,
  onToggle,
  reducedMotion,
  tiltRef,
  visual,
}: Omit<ProductViewer3DProps, 'active' | 'className' | 'fallbackImage'>) {
  const energy = useRef({ value: isLit ? 1 : 0 }) as FlameEnergy;
  const candlePosition: [number, number, number] = [0, -0.14, 0];

  return (
    <>
      <SceneLighting
        candlePosition={candlePosition}
        compact={compact}
        energy={energy}
      />
      {!compact && (
        <Environment resolution={128}>
          <Lightformer
            color="#fff4dc"
            intensity={2.2}
            position={[0, 4, -4]}
            rotation-x={Math.PI / 2}
            scale={[6, 6, 1]}
          />
          <Lightformer
            color="#d8eee8"
            intensity={1.5}
            position={[-4, 1, 2]}
            rotation-y={Math.PI / 2}
            scale={[4, 7, 1]}
          />
          <Lightformer
            color="#f0b4a4"
            intensity={1}
            position={[4, -1, 1]}
            rotation-y={-Math.PI / 2}
            scale={[3, 5, 1]}
          />
        </Environment>
      )}
      <Sparkles
        color="#c9a35e"
        count={reducedMotion ? 8 : compact ? 14 : 28}
        noise={reducedMotion ? 0 : 0.45}
        opacity={0.22}
        position={[0, 0, -0.8]}
        scale={[5, 4.5, 3]}
        size={compact ? 1 : 1.25}
        speed={reducedMotion ? 0 : 0.16}
      />

      <PresentationControls
        cursor
        enabled={!reducedMotion}
        global={false}
        polar={[-0.5, 0.5]}
        rotation={[0, 0, 0]}
        snap={false}
        speed={0.58}
        azimuth={[-Math.PI, Math.PI]}
      >
        <TiltGroup reducedMotion={reducedMotion} tiltRef={tiltRef}>
          <Float
            floatingRange={[-0.025, 0.025]}
            floatIntensity={reducedMotion ? 0 : 0.08}
            rotationIntensity={0}
            speed={reducedMotion ? 0 : 0.8}
          >
            <group position={candlePosition} scale={1.02}>
              <CandleModel
                compact={compact}
                energy={energy}
                isLit={isLit}
                onToggle={onToggle}
                reducedMotion={reducedMotion}
                visual={visual}
              />
            </group>
          </Float>
        </TiltGroup>
      </PresentationControls>

      <mesh receiveShadow position={[0, -1.59, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.7, 64]} />
        <meshStandardMaterial color="#e9e4da" metalness={0.08} roughness={0.58} />
      </mesh>
      <ContactShadows
        blur={2.8}
        color="#17150f"
        far={3.5}
        frames={1}
        opacity={0.46}
        position={[0, -1.57, 0]}
        resolution={compact ? 128 : 256}
        scale={4.8}
      />

      {!compact && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.68}
            luminanceSmoothing={0.25}
            luminanceThreshold={0.86}
            mipmapBlur
            resolutionScale={0.55}
          />
          <Vignette darkness={0.2} offset={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

function ContextGuard({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleLoss = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener('webglcontextlost', handleLoss);
    return () => canvas.removeEventListener('webglcontextlost', handleLoss);
  }, [gl, onLost]);

  return null;
}

export const ProductViewer3D = forwardRef<ProductViewerHandle, ProductViewer3DProps>(
  function ProductViewer3D(
    {
      active = true,
      className,
      compact = false,
      fallbackImage,
      isLit,
      onToggle,
      reducedMotion,
      tiltRef,
      visual,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [failed, setFailed] = useState(() => !supportsWebGL());
    const [pageVisible, setPageVisible] = useState(
      () => typeof document === 'undefined' || document.visibilityState === 'visible',
    );

    useEffect(() => {
      const updateVisibility = () =>
        setPageVisible(document.visibilityState === 'visible');
      document.addEventListener('visibilitychange', updateVisibility);
      return () =>
        document.removeEventListener('visibilitychange', updateVisibility);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        capturePreview() {
          try {
            return canvasRef.current?.toDataURL('image/jpeg', 0.82) ?? null;
          } catch (error) {
            console.error('Astraya customization preview could not be captured.', error);
            return null;
          }
        },
      }),
      [],
    );

    const fallback = (
      <div className="relative h-full w-full overflow-hidden bg-[#e9e4da]">
        <img
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          src={fallbackImage || '/images/placeholder-candle.svg'}
        />
        <div className="absolute inset-0 bg-astraya-navy/8" />
      </div>
    );

    return (
      <div
        className={cn(
          'relative h-full min-h-[22rem] overflow-hidden bg-[#e9e4da]',
          className,
        )}
        data-testid="product-viewer-3d"
      >
        {failed ? (
          fallback
        ) : (
          <ViewerBoundary fallback={fallback}>
            <Canvas
              camera={{ far: 30, fov: 38, near: 0.1, position: [0, 0.15, 7.05] }}
              dpr={[1, compact ? 1.1 : 1.35]}
              frameloop={active && pageVisible ? 'always' : 'never'}
              gl={{
                alpha: false,
                antialias: !compact,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: true,
              }}
              shadows={!compact}
              onCreated={({ gl }) => {
                canvasRef.current = gl.domElement;
                gl.outputColorSpace = SRGBColorSpace;
                gl.shadowMap.type = PCFShadowMap;
                gl.toneMapping = ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.05;
                gl.setClearColor(0xe9e4da, 1);
              }}
            >
              <ContextGuard onLost={() => setFailed(true)} />
              <ViewerContent
                compact={compact}
                isLit={isLit}
                onToggle={onToggle}
                reducedMotion={reducedMotion}
                tiltRef={tiltRef}
                visual={visual}
              />
            </Canvas>
          </ViewerBoundary>
        )}
      </div>
    );
  },
);
