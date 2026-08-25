import { useState, useCallback } from 'react';

export default function useRateLimit(cooldownMs = 2000) {
  const [isLocked, setIsLocked] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  const execute = useCallback((actionFn) => {
    const now = Date.now();
    if (now - lastActionTime < cooldownMs) {
      // Still in cooldown
      return false; 
    }
    
    setIsLocked(true);
    setLastActionTime(now);
    
    // Execute action
    Promise.resolve(actionFn()).finally(() => {
      // Re-enable after cooldown passes from the start time, 
      // or immediately if the action took longer than cooldown.
      const elapsed = Date.now() - now;
      const remainingCooldown = Math.max(0, cooldownMs - elapsed);
      
      setTimeout(() => {
        setIsLocked(false);
      }, remainingCooldown);
    });

    return true; // Action executed
  }, [cooldownMs, lastActionTime]);

  return { isLocked, execute };
}
