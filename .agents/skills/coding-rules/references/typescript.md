# Web Frontend TypeScript and React

Apply only rules relevant to the changed code and prefer repository configuration and local patterns.

## Type Boundaries

- Treat external, persisted, URL, and browser-storage input as untrusted until validated.
- Prefer `unknown`, generics, unions, and type guards over `any` or suppression.
- Keep public Props, request/response shapes, and serialized values aligned with governing contracts.
- Use assertions only when the invariant is established at the same boundary and cannot be expressed more safely.

## React Boundaries

- Match the repository's component, state, data-fetching, routing, styling, and test patterns.
- Keep one authoritative owner for state and preserve unidirectional updates.
- Place browser-only behavior behind the repository's client boundary when server/client components coexist.
- Guard asynchronous effects against stale results and post-unmount updates using the repository's established mechanism.
- Use class components only where the repository or framework requires them, such as an existing Error Boundary contract.

Do not introduce a state library, server-state library, component hierarchy, alias convention, memoization strategy, or code-splitting pattern merely because it is common elsewhere.

## Environment and Security

- Read client environment values through the configured build-tool interface.
- Only expose variables explicitly intended for the client; never place secrets in frontend configuration or bundles.
- Surface missing required configuration as the governing contract specifies.
- Keep sensitive values out of UI errors and logs.

## Performance

Apply memoization, lazy loading, and bundle changes only when repository tooling, profiling, or a governing requirement supplies evidence. Verify the named metric or consumer-visible effect after the change.

## Completion Checks

- [ ] Project typecheck/build command passes
- [ ] No new `any`, suppression, or unchecked external input in changed code
- [ ] Props and serialized contracts match their source
- [ ] Async cleanup and race handling follow the repository pattern where applicable
- [ ] Performance changes have measured evidence
