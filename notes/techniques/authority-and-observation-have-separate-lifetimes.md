# Authority and observation have separate lifetimes

A page losing permission to ask a question does not answer the question it
already asked. A session can expire after a write committed. A cancel request
can arrive after a job completed. Closing a stream can leave its job running.

Treating all three as a generic canceled state makes the interface look settled
while its consequences remain unsettled. The useful split is between the
authority to issue another command, the lifecycle of observing an earlier
command, and the server's durable outcome. They may change independently.

Recovery should restore only what it has verified. Signing in restores account
access; it does not authorize replaying an unresolved write. Receiving a cancel
acknowledgment confirms a request; it does not establish a terminal job state.
Reconnecting restores observation; it does not make the cached snapshot current.

This also changes how a failure is demonstrated: arrange for the server to have
already acted, then interrupt the client's view. A failure inserted only before
delivery cannot reveal whether the client respects this distinction.
