import { ArrowLeftRight, Target } from "lucide-react";

export type Section = "conversiones" | "objetivos";

export const VALID_SECTIONS: Section[] = ["conversiones", "objetivos"];

export const parseSection = (value: string | null): Section | null =>
  value && (VALID_SECTIONS as string[]).includes(value)
    ? (value as Section)
    : null;

export type SidebarLink = {
  id: Section;
  label: string;
  icon: typeof ArrowLeftRight;
};

export const sidebarLinks: SidebarLink[] = [
  { id: "conversiones", label: "Conversiones", icon: ArrowLeftRight },
  { id: "objetivos", label: "Objetivos", icon: Target },
];
