import { motion, useReducedMotion } from 'framer-motion';

export function CandlePourScene() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="candle-pour-scene" aria-hidden="true">
      <motion.div
        className="candle-pour-scene__pitcher"
        initial={prefersReducedMotion ? false : { opacity: 0, rotate: -8, y: -12 }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0, 1, 1, 1],
                rotate: [-8, -8, 18, -8],
                y: [-12, 0, 8, 0],
              }
        }
        transition={{
          delay: 1.25,
          duration: 5.2,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.2, 0.56, 1],
        }}
      >
        <span className="candle-pour-scene__spout" />
        <span className="candle-pour-scene__handle" />
        <span className="candle-pour-scene__shine" />
      </motion.div>

      <motion.span
        className="candle-pour-scene__stream"
        initial={prefersReducedMotion ? false : { opacity: 0, scaleY: 0 }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0, 0, 1, 1, 0],
                scaleY: [0, 0, 1, 1, 0.08],
              }
        }
        transition={{
          delay: 2.2,
          duration: 2.8,
          ease: 'easeInOut',
          times: [0, 0.12, 0.28, 0.78, 1],
        }}
      />

      <div className="candle-pour-scene__jar">
        <motion.span
          className="candle-pour-scene__wax"
          initial={prefersReducedMotion ? { height: '72%' } : { height: '12%' }}
          animate={prefersReducedMotion ? undefined : { height: '72%' }}
          transition={{ delay: 2.45, duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <span className="candle-pour-scene__wick" />
        <motion.span
          className="candle-pour-scene__flame-wrap"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.2, y: 8 }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }
          }
          transition={{ delay: 5, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="candle-pour-scene__flame" />
        </motion.span>
        <span className="candle-pour-scene__label">A</span>
      </div>
    </div>
  );
}
