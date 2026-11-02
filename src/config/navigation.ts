import {
  CalendarCheck,
  CalendarDays,
  Compass,
  CreditCard,
  FileText,
  Flag,
  House,
  LayoutDashboard,
  MessagesSquare,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  UsersRound,
  Utensils,
  WalletCards,
} from "lucide-react";
import type { AppRole, RoleNavigation } from "@/types/navigation";

export const roleNavigation: Record<AppRole, RoleNavigation> = {
  customer: {
    name: "Customer",
    workspaceLabel: "Your table",
    homeHref: "/home",
    items: [
      { label: "Home", href: "/home", icon: House },
      { label: "Explore kitchens", href: "/explore", icon: Compass },
      { label: "My requests", href: "/requests", icon: FileText },
      { label: "Subscriptions", href: "/subscriptions", icon: CalendarDays },
      { label: "Communities", href: "/communities", icon: UsersRound },
      { label: "Profile", href: "/profile", icon: UserRound },
    ],
  },
  provider: {
    name: "Provider",
    workspaceLabel: "Kitchen workspace",
    homeHref: "/provider/dashboard",
    items: [
      { label: "Overview", href: "/provider/dashboard", icon: LayoutDashboard },
      { label: "My kitchen", href: "/provider/kitchen", icon: Store },
      { label: "Plans", href: "/provider/plans", icon: CalendarCheck },
      { label: "Menus", href: "/provider/menus", icon: Utensils },
      { label: "Requests", href: "/provider/requests", icon: FileText },
      { label: "Customers", href: "/provider/customers", icon: UsersRound },
      {
        label: "Subscriptions",
        href: "/provider/subscriptions",
        icon: CalendarDays,
      },
      {
        label: "Community",
        href: "/provider/community",
        icon: MessagesSquare,
      },
      { label: "Payments", href: "/provider/payments", icon: WalletCards },
    ],
  },
  admin: {
    name: "Administrator",
    workspaceLabel: "Platform operations",
    homeHref: "/admin/dashboard",
    items: [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Kitchens", href: "/admin/kitchens", icon: Store },
      { label: "Customers", href: "/admin/customers", icon: UsersRound },
      { label: "Providers", href: "/admin/providers", icon: UserRound },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Reviews", href: "/admin/reviews", icon: ShieldCheck },
      { label: "Reports", href: "/admin/reports", icon: Flag },
    ],
  },
};

export const roleSwitcherItems = [
  { label: "Customer", href: "/home", icon: Search },
  { label: "Provider", href: "/provider/dashboard", icon: Store },
  { label: "Admin", href: "/admin/dashboard", icon: ShieldCheck },
] as const;
