import { cn } from "@/lib/kernel";
import s from "./avatar.module.css";

export type AvatarProps = {
  /** The person's name. REQUIRED even when an image is present: it is the
   *  fallback's content and the image's alternative text, and an avatar with
   *  neither is a decorative circle claiming to identify somebody. */
  name: string;
  src?: string;
  size?: "sm" | "md";
  className?: string;
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span className={cn(s.avatar, size === "sm" ? s.sm : s.md, className)} title={name}>
      {src ? (
        /* A plain img, not the framework's optimised one. This group is meant
           to copy to the sibling templates, and that component exists in one of
           the three. An avatar is small and usually already sized; a product
           that wants the optimiser swaps this one line, in one file.
           a product that wants the optimiser swaps this one line, in one file. */
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.image} src={src} alt={name} />
      ) : (
        <span className={s.initials} aria-hidden="true">{initials(name)}</span>
      )}
      {src ? null : <span className={s.hidden}>{name}</span>}
    </span>
  );
}
