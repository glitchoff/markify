import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getThemeCss, type HljsTheme } from "./themes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let themeInjected = false;

export function injectHljsTheme(theme?: HljsTheme, customCss?: string) {
  if (themeInjected || typeof document === "undefined") return;
  themeInjected = true;

  const id = "markify-hljs-theme";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = customCss || getThemeCss(theme ?? "dark");
  document.head.appendChild(style);
}
