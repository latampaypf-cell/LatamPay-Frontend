import { History, Info, type LucideIcon } from "lucide-react";

export type Section = "history" | "about";

export const VALID_SECTIONS: Section[] = ["history", "about"];

export const parseSection = (value: string | null): Section | null =>
  value && (VALID_SECTIONS as string[]).includes(value)
    ? (value as Section)
    : null;

export type SidebarLink = {
  id: Section;
  label: string;
  icon: LucideIcon;
};

export const sidebarLinks: SidebarLink[] = [
  { id: "history", label: "Historial", icon: History },
  { id: "about", label: "Acerca de LatamPay", icon: Info },
];
