"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorSurface } from "@/components/feedback";
import { Panel } from "@/components/display";
import { Button } from "@/components/forms";
import { Container, Flex } from "@/components/layout";
import { asFailure } from "@/lib/kernel";

/* A boundary INSIDE the shell, so the shell survives.
 *
 * A route-segment boundary replaces only what is below it — the header, the
 * sidebar and the preference toggles stay, and the reader can navigate away
 * instead of being dropped onto a bare page with a back button. That is the
 * whole argument for putting one here as well as at the root: the root's
 * catches things the shell itself could not render, and this catches a screen.
 *
 * It is reachable through the real stack: the guard throws when it could not
 * find out who you are — as opposed to finding out that you are nobody, which
 * is a redirect. `/cookbook/chaos` can produce it with
 * `GET /auth/me=fail:unavailable`. */
export default function ScreenErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const cookbook = usePathname().startsWith("/cookbook");
  return (
    <Container width="page">
      <Flex direction="column" gap={6}>
        <Panel title="This screen did not load">
          <ErrorSurface
            failure={asFailure(error)}
            digest={error.digest}
            title="Something stopped it"
            onRetry={reset}
            action={<Button asChild intent="ghost"><Link href={cookbook ? "/cookbook" : "/app"}>{cookbook ? "Cookbook" : "Home"}</Link></Button>}
          />
        </Panel>
      </Flex>
    </Container>
  );
}
