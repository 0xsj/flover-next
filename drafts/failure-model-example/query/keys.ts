/** Every cache key in one file, built by a function rather than spelled at a
 *  call site.
 *
 *  Two spellings of the same key are two caches that disagree, and the symptom
 *  is a screen that will not update after a mutation — which reads as a stale
 *  server rather than as a typo. Hierarchical on purpose: invalidating
 *  `targets.all(ws)` reaches `targets.one(id)` too, because keys match by
 *  prefix. */
export const keys = {
  targets: {
    all: (workspace: string) => ["targets", workspace] as const,
    one: (id: string) => ["targets", "one", id] as const,
    primary: (workspace: string) => ["targets", "primary", workspace] as const,
  },
};
