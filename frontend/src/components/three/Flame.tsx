import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Billboard, useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import {
  AdditiveBlending,
  DoubleSide,
  type Group,
  type ShaderMaterial,
} from 'three';

import type { FlameEnergy } from '@/components/three/types';

const flameVertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uEnergy;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float upperFlame = smoothstep(0.12, 1.0, uv.y);
    transformed.x += sin(uTime * 4.6 + uv.y * 5.0) * 0.035 * upperFlame * uEnergy;
    transformed.y += sin(uTime * 7.2 + uv.x * 6.0) * 0.01 * uEnergy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const flameFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uEnergy;

  void main() {
    float vertical = smoothstep(0.0, 0.1, vUv.y) * (1.0 - smoothstep(0.84, 1.0, vUv.y));
    float taper = mix(0.42, 0.025, smoothstep(0.04, 0.96, vUv.y));
    float sway = sin(uTime * 5.1 + vUv.y * 7.0) * 0.025 * vUv.y * uEnergy;
    float distanceFromCore = abs(vUv.x - 0.5 - sway);
    float body = 1.0 - smoothstep(taper * 0.72, taper, distanceFromCore);
    float alpha = body * vertical * uEnergy;

    vec2 coreUv = vec2((vUv.x - 0.5) * 1.7, vUv.y - 0.28);
    float core = 1.0 - smoothstep(0.02, 0.24, length(coreUv));
    vec3 amber = vec3(1.8, 0.28, 0.025);
    vec3 gold = vec3(3.4, 1.35, 0.16);
    vec3 ivory = vec3(5.2, 3.9, 1.45);
    vec3 color = mix(amber, gold, smoothstep(0.08, 0.92, vUv.y));
    color = mix(color, ivory, core);

    gl_FragColor = vec4(color, alpha * 0.94);
  }
`;

type FlameProps = {
  energy: FlameEnergy;
  isLit: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
};

export function Flame({ energy, isLit, onToggle, reducedMotion }: FlameProps) {
  const outerRef = useRef<Group>(null);
  const flickerRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);
  useCursor(isHovered);

  const uniforms = useMemo(
    () => ({
      uEnergy: { value: isLit ? 1 : 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  useLayoutEffect(() => {
    const flame = outerRef.current;
    if (!flame) {
      return undefined;
    }

    gsap.killTweensOf(flame.rotation);
    gsap.killTweensOf(flame.scale);
    gsap.killTweensOf(energy.current);

    const timeline = gsap.timeline();
    if (reducedMotion) {
      gsap.set(flame.rotation, { z: 0 });
      gsap.set(flame.scale, { x: 1, y: 1, z: 1 });
      flame.visible = true;
      timeline
        .to(energy.current, {
          value: isLit ? 1 : 0,
          duration: 0.24,
          ease: 'power1.out',
        })
        .set(flame, { visible: isLit });
    } else if (isLit) {
      flame.visible = true;
      timeline
        .set(flame.rotation, { z: 0.28 })
        .set(flame.scale, { x: 0.08, y: 0.04, z: 0.08 })
        .to(energy.current, { value: 1, duration: 0.72, ease: 'power2.out' }, 0)
        .to(flame.rotation, { z: 0, duration: 0.55, ease: 'back.out(1.7)' }, 0)
        .to(
          flame.scale,
          { x: 1, y: 1, z: 1, duration: 0.68, ease: 'back.out(1.6)' },
          0,
        );
    } else {
      timeline
        .to(flame.rotation, { z: -0.48, duration: 0.16, ease: 'power2.out' }, 0)
        .to(
          flame.scale,
          { x: 1.36, y: 0.7, z: 1, duration: 0.16, ease: 'power2.out' },
          0,
        )
        .to(energy.current, { value: 0, duration: 0.88, ease: 'power2.inOut' }, 0.08)
        .to(
          flame.scale,
          { x: 0.12, y: 0.02, z: 0.12, duration: 0.46, ease: 'power3.in' },
          0.2,
        )
        .set(flame, { visible: false });
    }

    return () => {
      timeline.kill();
    };
  }, [energy, isLit, reducedMotion]);

  useFrame(({ clock, pointer }) => {
    const time = clock.elapsedTime;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = reducedMotion ? 0 : time;
      materialRef.current.uniforms.uEnergy.value = energy.current.value;
    }

    if (!flickerRef.current || energy.current.value <= 0.01) {
      return;
    }

    if (reducedMotion) {
      flickerRef.current.scale.set(1, 1, 1);
      flickerRef.current.rotation.z = 0;
      return;
    }

    const width = 1 + Math.sin(time * 10.7) * 0.035 + Math.sin(time * 17.3) * 0.018;
    const height = 1 + Math.sin(time * 12.3 + 0.8) * 0.055;
    flickerRef.current.scale.set(width, height, 1);
    flickerRef.current.rotation.z = Math.sin(time * 5.4) * 0.024 + pointer.x * 0.025;
  });

  return (
    <group
      ref={outerRef}
      position={[0, 1.68, 0.02]}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      onPointerOut={() => setIsHovered(false)}
      onPointerOver={(event) => {
        event.stopPropagation();
        setIsHovered(true);
      }}
    >
      <Billboard follow>
        <group ref={flickerRef}>
          <mesh>
            <planeGeometry args={[0.5, 0.96, 24, 24]} />
            <shaderMaterial
              ref={materialRef}
              blending={AdditiveBlending}
              depthTest
              depthWrite={false}
              fragmentShader={flameFragmentShader}
              side={DoubleSide}
              toneMapped={false}
              transparent
              uniforms={uniforms}
              vertexShader={flameVertexShader}
            />
          </mesh>
        </group>
      </Billboard>
    </group>
  );
}
