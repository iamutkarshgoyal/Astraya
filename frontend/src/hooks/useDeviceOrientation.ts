import { useCallback, useEffect, useRef, useState } from 'react';

import type { DeviceTiltValue } from '@/types/customization';

type OrientationPermissionEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'denied' | 'granted'>;
};

export type DeviceOrientationStatus =
  | 'available'
  | 'denied'
  | 'enabled'
  | 'unsupported';

function initialStatus(reducedMotion: boolean): DeviceOrientationStatus {
  if (
    reducedMotion ||
    typeof window === 'undefined' ||
    !('DeviceOrientationEvent' in window)
  ) {
    return 'unsupported';
  }
  return 'available';
}

export function useDeviceOrientation(reducedMotion: boolean) {
  const tiltRef = useRef<DeviceTiltValue>({ active: false, x: 0, y: 0 });
  const [status, setStatus] = useState<DeviceOrientationStatus>(() =>
    initialStatus(reducedMotion),
  );

  useEffect(() => {
    if (reducedMotion) {
      tiltRef.current = { active: false, x: 0, y: 0 };
      setStatus('unsupported');
    } else if ('DeviceOrientationEvent' in window && status === 'unsupported') {
      setStatus('available');
    }
  }, [reducedMotion, status]);

  useEffect(() => {
    if (status !== 'enabled') {
      return undefined;
    }

    const updateTilt = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0;
      const beta = event.beta ?? 0;
      tiltRef.current.active = true;
      tiltRef.current.x = Math.max(-1, Math.min(1, gamma / 34));
      tiltRef.current.y = Math.max(-1, Math.min(1, (beta - 42) / 44));
    };

    window.addEventListener('deviceorientation', updateTilt, { passive: true });
    return () => {
      window.removeEventListener('deviceorientation', updateTilt);
      tiltRef.current = { active: false, x: 0, y: 0 };
    };
  }, [status]);

  const requestAccess = useCallback(async () => {
    if (
      reducedMotion ||
      typeof window === 'undefined' ||
      !('DeviceOrientationEvent' in window)
    ) {
      setStatus('unsupported');
      return false;
    }

    const OrientationEvent = DeviceOrientationEvent as OrientationPermissionEvent;
    try {
      if (typeof OrientationEvent.requestPermission === 'function') {
        const permission = await OrientationEvent.requestPermission();
        if (permission !== 'granted') {
          setStatus('denied');
          return false;
        }
      }
      setStatus('enabled');
      return true;
    } catch {
      setStatus('denied');
      return false;
    }
  }, [reducedMotion]);

  return { requestAccess, status, tiltRef };
}
