import { motion, useReducedMotion } from 'framer-motion';

const particles = [
  ['left-[8%] top-[18%]', 0.9],
  ['left-[18%] top-[62%]', 1.2],
  ['left-[34%] top-[24%]', 0.8],
  ['left-[52%] top-[14%]', 1.1],
  ['left-[69%] top-[58%]', 0.95],
  ['left-[84%] top-[28%]', 1.25],
  ['left-[91%] top-[73%]', 0.85],
] as const;

export function CelestialParticles() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map(([position, scale], index) => (
        <motion.span
          key={position}
          className={`absolute ${position} h-1.5 w-1.5 rounded-full bg-astraya-gold/70 shadow-[0_0_20px_rgba(212,176,106,0.5)]`}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: [0.22, 0.9, 0.22],
                  y: [0, -10 - index, 0],
                  scale: [scale, scale + 0.28, scale],
                }
          }
          transition={{
            duration: 4 + index * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <span className="absolute left-10 top-24 h-px w-24 rotate-[-18deg] bg-astraya-gold/30" />
      <span className="absolute bottom-20 right-12 h-px w-28 rotate-[14deg] bg-astraya-gold/25" />
    </div>
  );
}
