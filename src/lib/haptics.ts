import { useStore } from '../store/useStore';

export const vibrate = (pattern: number | number[]) => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) return;
  const { hapticsEnabled } = useStore.getState();
  if (hapticsEnabled) {
    try {
      window.navigator.vibrate(pattern);
    } catch(e) {
      // Ignore vibration errors
    }
  }
};

export const haptic = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  heavy: () => vibrate(30),
  success: () => vibrate([10, 50, 20]),
  error: () => vibrate([20, 50, 20, 50, 20]),
};
