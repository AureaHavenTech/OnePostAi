"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  /** Override auto-generated breadcrumbs with custom items */
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Auto-generates breadcrumbs from the current pathname.
 * Custom labels can be passed via the `items` prop.
 *
 * Examples:
 *   /dashboard/settings/profile → Dashboard > Settings > Profile
 *   /dashboard/organizer       → Dashboard > Organizer
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate from pathname if no custom items provided
  const crumbs: BreadcrumbItem[] =
    items ||
    pathname
      .split("/")
      .filter(Boolean)
      .map((segment, i, arr) => {
        const href = "/" + arr.slice(0, i + 1).join("/");
        const label = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return { label, href: i < arr.length - 1 ? href : undefined };
      });

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-xs py-2", className)}
    >
      <Link
        href="/dashboard"
        className="text-[#e8e0d4]/40 hover:text-[#c9a96e] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.slice(1).map((crumb, i) => {
        const isLast = i === crumbs.length - 2;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-[#e8e0d4]/20" />
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-[#e8e0d4]/40 hover:text-[#c9a96e] transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#e8e0d4]/70 font-medium">
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
