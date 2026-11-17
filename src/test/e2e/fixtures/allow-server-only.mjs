// Only the isolated Node browser host imports this hook. Next's product bundle
// retains its normal server-only enforcement; no client import uses this file.
export function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,export{}", shortCircuit: true };
  return nextResolve(specifier, context);
}
