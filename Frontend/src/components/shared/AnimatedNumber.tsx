import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export default function AnimatedNumber({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const count = useCountUp(value, duration);

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return num.toLocaleString();
  };

  return (
    <span className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

