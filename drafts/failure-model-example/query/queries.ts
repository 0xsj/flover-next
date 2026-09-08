import { queryOptions } from "@tanstack/react-query";
import { unwrap } from "@/lib/kernel";
import type { HttpClient } from "@/lib/http";
import { findPrimaryTarget, getTarget, listTargets } from "../services/targets";
import { keys } from "./keys";

/* THE ONE THROW SITE, and it is four lines.
 *
 * The cache marks a query failed by a rejected promise, so a Result has to
 * become an exception exactly here. Every tier below is free of invisible
 * control flow; every tier above recovers the value with `asFailure`.
 *
 * `queryOptions` keeps the key and the function together, so a caller cannot
 * pair the wrong two. */

export const targetsQuery = (client: HttpClient, workspace: string) =>
  queryOptions({
    queryKey: keys.targets.all(workspace),
    queryFn: async () => unwrap(await listTargets(client, workspace)),
  });

export const targetQuery = (client: HttpClient, id: string) =>
  queryOptions({
    queryKey: keys.targets.one(id),
    queryFn: async () => unwrap(await getTarget(client, id)),
  });

/** Three states survive the cache: `null` is a legitimate value, so "looked and
 *  found nothing" is a SUCCESS here and never an error branch. */
export const primaryTargetQuery = (client: HttpClient, workspace: string) =>
  queryOptions({
    queryKey: keys.targets.primary(workspace),
    queryFn: async () => unwrap(await findPrimaryTarget(client, workspace)),
  });
