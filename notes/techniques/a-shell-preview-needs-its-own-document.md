A shell preview embedded in a gallery can borrow the very dependencies it is supposed to demonstrate owning.

## Origin

Observed while adding the rail shell to Flover, 2026-09-10. Rendering complete
shells inside the catalog nested their main landmarks inside the catalog's main.
Moving them to independent preview documents also exposed a missing tooltip
provider that the surrounding gallery had supplied.

## What the boundary reveals

A shell owns page-level concerns: the main landmark, a skip target, viewport
layout, and scrolling. A miniature shell inside an ordinary panel can look
correct while inheriting a provider or CSS context its standalone caller lacks.
Hiding its landmarks for the demo would change the component being verified.

An iframe loading a real preview route lets the same shell run both in the
catalog and as a full page. Check each document's landmarks and exercise its
navigation; counting only the parent document misses the preview entirely.

The separation also has a cost. The frame has its own runtime stores and root
attributes. Shared storage does not make two copies of a store one live object.
Theme and density need explicit synchronization if the gallery promises that its
controls affect the previews. In this case, storage events and idempotent
hydration provided that bridge, in the preview wiring.

This boundary earns its cost for whole-page compositions. Ordinary controls can
still be demonstrated directly in the gallery, with their required providers
made explicit.

## Used in

Flover's standard, rail, and authentication shell previews; their full-page
routes and gallery embeds use the same rendering components.

## Related

[`a-portal-splits-the-two-trees`](a-portal-splits-the-two-trees.md),
[`composition-outlasts-configuration`](composition-outlasts-configuration.md).
