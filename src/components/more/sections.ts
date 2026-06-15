import { Bot, History, Info, type LucideIcon } from "lucide-react";

export type Section = "history" | "support" | "about";

export const VALID_SECTIONS: Section[] = ["history", "support", "about"];

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
  { id: "support", label: "Soporte", icon: Bot },
  { id: "about", label: "Acerca de LatamPay", icon: Info },
];
