import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const isDesktopNow = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches;

export const useSectionParam = <T extends string>(
  parse: (value: string | null) => T | null,
  defaultDesktop: T,
  paramName = "section",
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDesktop, setIsDesktop] = useState(isDesktopNow);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const fromUrl = parse(searchParams.get(paramName));
  const section: T | null = fromUrl ?? (isDesktop ? defaultDesktop : null);

  const selectSection = (next: T) => {
    if (searchParams.get(paramName) === next) return;
    const params = new URLSearchParams(searchParams);
    params.set(paramName, next);
    setSearchParams(params, { replace: true });
  };

  const clearSection = () => {
    if (!searchParams.get(paramName)) return;
    const params = new URLSearchParams(searchParams);
    params.delete(paramName);
    setSearchParams(params, { replace: true });
  };

  return { section, selectSection, clearSection };
};
