import type { ReactNode } from "react";

export default function Header({ children }: { children: ReactNode }) {
  return (
    <header className="bg-gray-900 pt-safe-top">
      <div className="flex items-start justify-between py-4 px-2">
        {children}
      </div>
    </header>
  );
}
