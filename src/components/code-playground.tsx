import { lazy, Suspense } from 'react';

export type SandboxEditorProps = {
  files: Record<string, string>;
  template?:
    | 'react-ts'
    | 'static'
    | 'svelte'
    | 'test-ts'
    | 'vanilla-ts'
    | 'nextjs'
    | 'node'
    | 'vite'
    | 'vite-react'
    | 'vite-react-ts'
    | 'vite-vue'
    | 'vite-vue-ts'
    | 'vite-svelte'
    | 'vite-svelte-ts';
  customSetup?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  autorun?: boolean;
  defaultTab?: 'preview' | 'console';
  editorHeight?: number;
};

const LazyCodePlaygroundInner = lazy(() => import('./code-playground-inner'));

export function CodePlayground(props: SandboxEditorProps) {
  return (
    <div className={`my-10 ${props.className || ''}`}>
      {/* Breakout container - extends beyond text column on desktop */}
      <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen px-4 md:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <Suspense
            fallback={
              <div className="flex h-[500px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-center">
                  <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300"></div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Loading code editor...
                  </p>
                </div>
              </div>
            }
          >
            <LazyCodePlaygroundInner {...props} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
