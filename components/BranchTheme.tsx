"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { branchForPath } from "@/lib/branches";

/**
 * Sets `data-branch` on <html> based on the active route. The colour wash and
 * transition live in CSS (globals.css), so navigating between branches animates
 * the whole-page background from one motto-colour to the next.
 */
export default function BranchTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const branch = branchForPath(pathname);
    const root = document.documentElement;
    if (branch) root.dataset.branch = branch;
    else delete root.dataset.branch; // core / neutral landing
  }, [pathname]);

  return null;
}
