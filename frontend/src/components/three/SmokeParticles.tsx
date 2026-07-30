import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  NormalBlending,
  type ShaderMaterial,
} from 'three';

const smokeVertexShader = `
  attribute float aDelay;
  attribute float aSeed;
  uniform float uMotion;
  uniform float uPointSize;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    float elapsed = max(0.0, uTime - aDelay);
    float life = clamp(elapsed / 3.4, 0.0, 1.0);
    vec3 transformed = position;
    transformed.y += life * mix(0.16, 1.55, uMotion);
    transformed.x += sin(aSeed * 11.0 + life * 7.0) * 0.15 * life * uMotion;
    transformed.z += cos(aSeed * 7.0 + life * 5.0) * 0.07 * life * uMotion;

    vAlpha = step(aDelay, uTime) * smoothstep(0.0, 0.12, life) * (1.0 - life);
    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uPointSize * (1.0 - life * 0.55) * (70.0 / -viewPosition.z);
  }
`;

const smokeFragmentShader = `
  varying float vAlpha;

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float softness = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    vec3 smokeColor = mix(vec3(0.38, 0.42, 0.47), vec3(0.72, 0.73, 0.72), softness);
    gl_FragColor = vec4(smokeColor, softness * vAlpha * 0.34);
  }
`;

export function SmokeParticles({
  compact = false,
  reducedMotion = false,
}: {
  compact?: boolean;
  reducedMotion?: boolean;
}) {
  const materialRef = useRef<ShaderMaterial>(null);
  const startedAt = useRef<number | null>(null);
  const count = reducedMotion ? 6 : compact ? 10 : 22;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.39996;
      const radius = (index % 5) * 0.008;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = 0;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
      delays[index] = 0.3 + (index / count) * 1.25;
      seeds[index] = ((index * 37) % 101) / 101;
    }

    const nextGeometry = new BufferGeometry();
    nextGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    nextGeometry.setAttribute('aDelay', new BufferAttribute(delays, 1));
    nextGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    return nextGeometry;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uMotion: { value: reducedMotion ? 0 : 1 },
      uPointSize: { value: compact ? 3.6 : 5.2 },
      uTime: { value: 0 },
    }),
    [compact, reducedMotion],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }
    if (startedAt.current === null) {
      startedAt.current = clock.elapsedTime;
    }
    materialRef.current.uniforms.uTime.value = clock.elapsedTime - startedAt.current;
  });

  return (
    <points geometry={geometry} position={[0, 1.43, 0]}>
      <shaderMaterial
        ref={materialRef}
        blending={NormalBlending}
        depthTest
        depthWrite={false}
        fragmentShader={smokeFragmentShader}
        transparent
        uniforms={uniforms}
        vertexShader={smokeVertexShader}
      />
    </points>
  );
}
