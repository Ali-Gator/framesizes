import { type ComponentType, lazy, Suspense } from "react";

/**
 * `next/dynamic` for the extension's Vite build: the component loads on first render, as on the
 * site. G1's loader resolves to the component itself, not a module.
 */
export default function dynamic<P extends object>(
  loader: () => Promise<ComponentType<P>>,
): ComponentType<P> {
  const Lazy = lazy(() => loader().then((component) => ({ default: component })));
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}
