import type { ReactNode } from "react";

const keyframes = `
  @keyframes spinner {
    0% { opacity: 1; }
    100% { opacity: 0.25; }
  }
`;

export default function Spinner({
  loading = true,
  children = null,
  className,
}: {
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}): JSX.Element | null {
  if (!loading) return <>{children}</>;

  const spinner = (
    <span className={`relative inline-flex ${className ?? "size-4"}`}>
      <style>{keyframes}</style>
      {Array.from(Array(8).keys()).map((i) => (
        <span
          key={i}
          className="absolute left-[calc(50%-12.5%/2)] top-0 h-[100%] w-[12.5%] animate-[spinner_800ms_linear_infinite] before:block before:h-[30%] before:w-[100%] before:rounded-full before:bg-white/50"
          style={{
            transform: `rotate(${45 * i}deg)`,
            animationDelay: `calc(-${8 - i} / 8 * 800ms)`,
          }}
        />
      ))}
    </span>
  );

  if (!children) return spinner;

  return (
    <span className="relative flex items-center justify-center">
      <span className="invisible">{children}</span>

      <span className="absolute inset-0 flex items-center justify-center">
        {spinner}
      </span>
    </span>
  );
}
