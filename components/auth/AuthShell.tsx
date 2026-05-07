import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

type AuthShellAlignment = "left" | "right" | "center";
type AuthShellImagePosition = "left" | "right" | "center";

interface AuthShellProps {
  children: ReactNode;
  alignment?: AuthShellAlignment;
  imagePosition?: AuthShellImagePosition;
}

const alignmentClasses: Record<AuthShellAlignment, string> = {
  left: "justify-center md:justify-start",
  right: "justify-center md:justify-end",
  center: "justify-center",
};

const imagePositionClasses: Record<AuthShellImagePosition, string> = {
  left: "object-center md:object-[20%_center]",
  right: "object-center md:object-[75%_center]",
  center: "object-center",
};

export default function AuthShell({
  children,
  alignment = "center",
  imagePosition = "center",
}: AuthShellProps) {
  return (
    <div className="brand-page-shell relative min-h-[100dvh] overflow-hidden bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,0,122,0.08),transparent_30%)]" />
        <div className="absolute inset-0 mx-auto w-full max-w-[1440px]">
          <div className="absolute left-[-5rem] top-[10%] h-52 w-52 rounded-full bg-pink-300/25 blur-3xl sm:h-72 sm:w-72" />
          <div className="absolute right-[-4rem] top-[12%] h-48 w-48 rounded-full bg-purple-300/25 blur-3xl sm:h-64 sm:w-64" />
          <div className="absolute bottom-[-6rem] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-300/20 blur-3xl sm:h-80 sm:w-80" />

          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-8">
            <div className="relative h-[70vh] w-full max-w-[1500px] sm:h-[78vh] md:h-[92vh]">
              <Image
                src="/images/light.svg"
                alt=""
                fill
                priority
                sizes="100vw"
                className={cn(
                  "object-contain opacity-95",
                  imagePositionClasses[imagePosition]
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1440px] items-center px-4 py-8 sm:px-6 md:px-10 lg:px-12",
          alignmentClasses[alignment]
        )}
      >
        {children}
      </div>
    </div>
  );
}
