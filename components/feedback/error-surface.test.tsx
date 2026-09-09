import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorSurface } from "./error-surface";
import {
  AppError, asFailure, forbidden, internal, timeout, unavailable,
} from "@/lib/kernel";

/* What a reader is told when a screen could not render.
 *
 * The interesting half is what it must NOT say: a redacted server error carries
 * no real message and classifies as `internal`, so presenting either as
 * meaningful is reporting the redaction rather than the fault. */

describe("a failure that kept its detail", () => {
  it("says what actually went wrong", () => {
    render(<ErrorSurface failure={unavailable("The server could not be reached.")} />);
    expect(screen.getByText("The server could not be reached.")).toBeInTheDocument();
  });

  it("quotes the ids that make it findable", () => {
    render(
      <ErrorSurface
        failure={timeout("slow", { correlationId: "cid-1", requestId: "req-2" })}
      />,
    );
    expect(screen.getByText("cid-1")).toBeInTheDocument();
    expect(screen.getByText("req-2")).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
  });

  it("is announced, because a reader who cannot see it still needs it", () => {
    render(<ErrorSurface failure={unavailable("down")} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("a redacted server failure", () => {
  const redacted = { failure: internal("An error occurred in the Server Components render."), digest: "3f9a2b" };

  it("does not present the replaced message as though it meant something", () => {
    render(<ErrorSurface {...redacted} />);
    expect(screen.queryByText(/Server Components render/)).toBeNull();
    expect(screen.getByText(/details are in its log/i)).toBeInTheDocument();
  });

  it("shows the digest, which is the only thing that survived", () => {
    render(<ErrorSurface {...redacted} />);
    expect(screen.getByText("3f9a2b")).toBeInTheDocument();
  });

  it("does not report the kind, because `internal` is the redaction not the fault", () => {
    render(<ErrorSurface {...redacted} />);
    expect(screen.queryByText("internal")).toBeNull();
  });
});

describe("a retry is offered only when it could work", () => {
  it("offered for a fault", () => {
    render(<ErrorSurface failure={unavailable("down")} onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("NOT offered for an answer, and it says why", () => {
    // A button that cannot change the outcome is a control that does nothing.
    render(<ErrorSurface failure={forbidden("You may not see this.")} onRetry={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(screen.getByText(/will not change this/i)).toBeInTheDocument();
  });

  it("offered for a redacted failure, because the kind is unknowable", () => {
    render(<ErrorSurface failure={internal("x")} digest="abc" onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});

describe("what a boundary actually receives", () => {
  it("an AppError from a client throw keeps its Failure", () => {
    // The structural branch in `asFailure`: this is the informative case.
    const thrown: unknown = new AppError(forbidden("No.", { correlationId: "cid-9" }));
    const failure = asFailure(thrown);
    expect(failure.kind).toBe("forbidden");
    expect(failure.correlationId).toBe("cid-9");
  });

  it("a plain Error becomes a Failure rather than throwing again", () => {
    // A boundary that can itself fail replaces one diagnosis with a worse one.
    expect(asFailure(new TypeError("undefined is not a function")).kind).toBe("internal");
    expect(asFailure("just a string").kind).toBe("internal");
    expect(asFailure(undefined).kind).toBe("internal");
  });
});
