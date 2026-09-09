import { PlannedSection, type Planned } from "../_components/planned";

/* The remaining component groups, as directories with a stated job.
 *
 * A group listed and empty says "this is where these go and none exist yet".
 * A group absent says "we decided against it", which is a different claim and
 * not the one being made. Each entry names the component's JOB rather than its
 * markup, because the job is the part that survives being rebuilt. */

const typography: Planned[] = [
  { name: "Heading", note: "a level, and a size that is not the level" },
  { name: "Text", note: "body copy, with the measure and the leading already right" },
  { name: "SectionLabel", note: "the small uppercase label, so it is one rule rather than twelve" },
];

export const TypeComponentsSection = () => (
  <PlannedSection
    id="type-components" title="Type components" components={typography}
    blurb="The section above shows the type TOKENS, which exist. These are the components that would spend them, and they do not. Listed rather than omitted: an empty group says where these go, and an absent one would say we decided against them."
  />
);
