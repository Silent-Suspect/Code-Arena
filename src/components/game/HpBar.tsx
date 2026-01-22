// HP Bar Component - Displays unit health
import { cn } from '../ui/cn';

interface HpBarProps {
    current: number;
    max: number;
    className?: string;
}

export function HpBar({ current, max, className }: HpBarProps) {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    // Color based on HP percentage
    const barColor = percentage > 60
        ? 'bg-emerald-500'
        : percentage > 30
            ? 'bg-amber-500'
            : 'bg-red-500';

    return (
        <div className={cn("w-full h-2 bg-gray-700 rounded-full overflow-hidden", className)}>
            <div
                className={cn("h-full transition-all duration-300 ease-out", barColor)}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
