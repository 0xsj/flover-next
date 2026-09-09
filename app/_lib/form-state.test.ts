import { describe, expect, it } from "vitest";
import {
  canceled, conflict, internal, invalid, notFound, rateLimited, timeout,
  unauthenticated, unavailable, forbidden, FAILURE_KINDS, type Failure,
} from "@/lib/kernel";
import { toFormState, type FormState } from "./form-state";

/* The seam where a Failure stops being a Failure.
 *
 * Every kind is exercised, because the value of the switch is that adding one
 * to the union breaks the build rather than falling through to a generic
 * apology. And every assertion goes through the TAG, because the point of the
 * union is that a caller cannot reach for `fields` without having established
 * it is there. */

const asError = (state: FormState) => {
  if (state.status !== "error") throw new Error(`expected an error, got ${state.status}`);
  return state;
};

describe("where a message goes is a decision the union holds", () => {
  it("invalid names fields, and `fields` is required on that arm", () => {
    const state = asError(toFormState(invalid("Check the form.", { email: "Required." })));
    expect(state.scope).toBe("fields");
    if (state.scope !== "fields") return;
    expect(state.fields).toEqual({ email: "Required." });
  });

  it("no other kind names a field by default", () => {
    // The negative control. Previously both were optional, so a form reading
    // `fields` on every refusal silently showed nothing here.
    for (const failure of [
      unauthenticated("no"), forbidden("no"), conflict("taken"),
      notFound("gone"), rateLimited("slow down", 30),
      timeout("slow"), unavailable("down"), canceled("stopped"), internal("boom"),
    ]) {
      expect(asError(toFormState(failure)).scope, failure.kind).toBe("form");
    }
  });

  it("but a screen may place one, which is why `scope` is the tag", () => {
    /* A taken email is a conflict — the form was well-formed and the world
       disagreed with it — and it still belongs on the email input, because that
       is the field the reader has to change. */
    const state = asError(
      toFormState(conflict("An account with that email already exists."), {
        fieldFor: (f) => (f.kind === "conflict" ? "email" : undefined),
      }),
    );
    expect(state.scope).toBe("fields");
    if (state.scope !== "fields") return;
    expect(state.fields.email).toContain("already exists");
    // The KIND is unchanged — placement is a rendering decision, not a reclassification.
    expect(state.kind).toBe("conflict");
  });

  it("and the hint is ignored when the kind already named fields", () => {
    const state = asError(
      toFormState(invalid("Check the form.", { name: "Required." }), {
        fieldFor: () => "email",
      }),
    );
    if (state.scope !== "fields") return expect.unreachable("expected fields");
    expect(state.fields).toEqual({ name: "Required." });
  });
});

describe("the kind rides along, because some refusals are not the reader's fault", () => {
  it("a rate limit carries its wait AND its kind", () => {
    /* Once the budget is spent a CORRECT password is refused too, so "check
       your details" is advice that cannot work. The form needs the kind to say
       something else. */
    const state = asError(toFormState(rateLimited("Too many attempts.", 30)));
    if (state.scope !== "form") return expect.unreachable("expected form scope");
    expect(state.retryAfter).toBe(30);
    expect(state.kind).toBe("rate_limited");
  });

  it("every kind survives into the state", () => {
    const build: Record<string, () => Failure> = {
      unauthenticated: () => unauthenticated("x"), forbidden: () => forbidden("x"),
      rate_limited: () => rateLimited("x", 1), unavailable: () => unavailable("x"),
      timeout: () => timeout("x"), canceled: () => canceled("x"),
      internal: () => internal("x"), not_found: () => notFound("x"),
      invalid: () => invalid("x", {}), conflict: () => conflict("x"),
    };
    for (const kind of FAILURE_KINDS) {
      expect(Object.keys(build), `no sample for ${kind}`).toContain(kind);
      const state = asError(toFormState(build[kind]()));
      expect(state.kind, kind).toBe(kind);
      expect(state.message, kind).toBeTruthy();
    }
  });
});

describe("what the reader is told", () => {
  it("a refusal they caused keeps the service's own sentence", () => {
    expect(asError(toFormState(unauthenticated("That email and password do not match."))).message)
      .toBe("That email and password do not match.");
  });

  it("a failure they did not cause becomes a reference, not a stack", () => {
    const state = asError(toFormState(internal("connection reset by peer", { correlationId: "cid-7" })));
    expect(state.message).toContain("cid-7");
    expect(state.message).not.toContain("connection reset");
  });

  it("and says something useful even with no id to quote", () => {
    expect(asError(toFormState(timeout("upstream took too long"))).message).toBeTruthy();
  });
});

describe("what was typed comes back", () => {
  it("echoed, so a refused submit does not empty the form", () => {
    const state = asError(toFormState(unauthenticated("no"), { values: { email: "ada@example.com" } }));
    expect(state.values).toEqual({ email: "ada@example.com" });
  });

  it("and absent when the caller passed nothing", () => {
    expect(asError(toFormState(unauthenticated("no"))).values).toBeUndefined();
  });
});
