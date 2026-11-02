import type { LucideIcon } from "lucide-react";

export type AppRole = "customer" | "provider" | "admin";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type RoleNavigation = {
  name: string;
  workspaceLabel: string;
  homeHref: string;
  items: NavigationItem[];
};
