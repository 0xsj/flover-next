# TypeScript has no `?`, and no combinator fixes it

Porting an errors-as-values design into TypeScript costs exactly one thing: there
is no propagation operator, so dependent sequencing stays an explicit early
return forever.

## Origin

Building a Result type informed by Rust, Go and Scala. Two of the three
properties those languages share port cleanly to TypeScript — a closed error set
with compiler-checked exhaustiveness, and errors as values rather than control
flow. The third does not.

## What

Three properties make errors-as-values bearable elsewhere:

    a closed set, and the compiler enforces the match     → TypeScript does this well
    errors are values, not control flow                   → TypeScript does this fully
    propagation is cheap                                  → TypeScript cannot

There is no `?`, and no do-notation. So this shape is permanent:

    const first = await step();
    if (!first.ok) return first;
    return second(first.value);

## Why say it rather than hide it

The instinct is to reach for combinators, and they help for the shapes that read
well — transforming a value, transforming an error, collecting independent
results, folding both branches at a render boundary. They do **not** help for
sequential dependence: the chained form of the code above is longer *and* harder
to read, and it gets worse the moment a local is needed twice.

Pretending otherwise is how the port becomes unbearable a month later, because
somebody wrote the whole codebase in a style that fights the language and nobody
wants to say so.

Write the cost down once, at the top of the module, and use the plain form
without apology.

## Gotchas

**Collecting independent results is worth a combinator, and it should preserve
the tuple.** Returning a homogeneous array from a heterogeneous input throws away
the types you were collecting.

**Returning the first failure rather than all of them is usually right** — a
screen rendering one problem surface has no use for the rest. Collecting all is a
different function, not a flag.

**The error type wants a default.** Making the failure type a defaulted type
parameter turns every signature in the codebase from two type arguments into one,
and that is the difference between a design people use and one they route around.

## Used in

`flover-next` and its two sibling templates — the service tier's return type.

## Related

[`value-inward-exception-at-the-edge`](../patterns/value-inward-exception-at-the-edge.md).
