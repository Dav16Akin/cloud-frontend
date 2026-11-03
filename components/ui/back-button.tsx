"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Where to go when there is no previous page in this tab. */
  fallbackHref?: string;
};

export function BackButton({
  children,
  className,
  id,
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // history.length is 1 when this tab opened straight onto the page, so
    // there is nothing to go back to.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button type="button" id={id} onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
