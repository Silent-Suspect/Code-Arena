// Game Loop Hook - Manages battle tick loop
import { useEffect, useRef, useCallback } from 'react';
import type { BattleState } from '../engine/types';
import { simulateTick } from '../engine/simulator';

const TICK_INTERVAL_MS = 1000; // 1 tick per second

interface UseGameLoopOptions {
    battleState: BattleState;
    onTick: (newState: BattleState) => void;
}

export function useGameLoop({ battleState, onTick }: UseGameLoopOptions) {
    const intervalRef = useRef<number | null>(null);
    const stateRef = useRef(battleState);

    // Keep ref in sync with state
    useEffect(() => {
        stateRef.current = battleState;
    }, [battleState]);

    const tick = useCallback(() => {
        const currentState = stateRef.current;
        if (currentState.status === 'FIGHTING') {
            const newState = simulateTick(currentState);
            onTick(newState);
        }
    }, [onTick]);

    // Start/stop loop based on battle status
    useEffect(() => {
        if (battleState.status === 'FIGHTING') {
            // Start the loop
            intervalRef.current = window.setInterval(tick, TICK_INTERVAL_MS);
        } else {
            // Stop the loop
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        // Cleanup on unmount
        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
            }
        };
    }, [battleState.status, tick]);

    return {
        isRunning: battleState.status === 'FIGHTING'
    };
}
