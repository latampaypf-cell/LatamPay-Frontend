import { ChevronRight } from "lucide-react";
import { sidebarLinks, type Section } from "./sections";

type Props = {
  section: Section | null;
  onSelect: (next: Section) => void;
};

export const MoreSidebar = ({ section, onSelect }: Props) => (
  <aside
    className={`h-fit rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl md:p-4 ${
      section !== null ? "hidden md:block" : "block"
    }`}
  >
    <nav>
      <ul className="space-y-2">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = section === link.id;

          return (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => onSelect(link.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left transition-all md:py-3 ${
                  isActive
                    ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm font-medium">{link.label}</span>
                </span>
                <ChevronRight size={16} className="text-slate-500 md:hidden" />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  </aside>
);

export default MoreSidebar;
