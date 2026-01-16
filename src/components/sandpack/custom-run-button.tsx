import { useSandpack } from '@codesandbox/sandpack-react';
import { PlayIcon } from './icons';

export function CustomRunButton() {
  const { sandpack } = useSandpack();
  const { status, runSandpack } = sandpack;

  if (status === 'running') return null;

  return (
    <button onClick={runSandpack} className="custom-run-button" aria-label="Run code">
      <PlayIcon />
      <span>Run</span>
    </button>
  );
}
