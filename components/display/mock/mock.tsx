import { cn } from "@/lib/kernel";
import s from "./mock.module.css";

export type MockProps = {
  /** What is being disclaimed, in the product's own words. */
  note?: string;
  className?: string;
};

/** A visible mark that what is on screen is NOT a record.
 *
 *  Announced, not decorative: somebody who cannot see the badge is exactly the
 *  person most likely to quote a fixture back at you as fact. */
export function Mock({ note = "Sample data. None of this is a record.", className }: MockProps) {
  return (
    <span className={cn(s.mock, className)} role="note">
      <span className={s.dot} aria-hidden="true" />
      {note}
    </span>
  );
}
