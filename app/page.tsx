import Link from "next/link";
import { Mark } from "@/components/chrome";
import s from "./page.module.css";

export default function Home() {
  return (
    <main className={s.page}>
      <div className={s.glow} aria-hidden="true" />

      <div className={s.body}>
        <Mark as="h1" size="display" />

        <p className={s.tagline}>
          A starter template, not a product. Clone it, delete what you do not
          need, and start with the plumbing already solved.
        </p>

        <div className={s.links}>
          <Link href="/sign-in" className={s.link}>
            Sign in
            <span className={s.arrow} aria-hidden="true">→</span>
          </Link>
          <Link href="/kitchen-sink" className={s.linkQuiet}>Kitchen sink</Link>
        </div>
      </div>

      <div className={s.foot}>Next · CSS Modules · own tokens</div>
    </main>
  );
}
