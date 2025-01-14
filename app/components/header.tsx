import type { ReactNode } from "react";

export default function Header({ children }: { children: ReactNode }) {
  return (
    <header className="bg-gray-900 pt-safe-top">
      <div className="flex items-center justify-between px-2 py-4">
        {children}
      </div>
    </header>
  );
}
