import { Sandpack } from '@codesandbox/sandpack-react';
import { amethyst } from '@codesandbox/sandpack-themes';
import type { SandboxEditorProps } from './code-playground';

export default function CodePlaygroundInner({
  files,
  template = 'react-ts',
  editorProps = {
    showLineNumbers: true,
    editorHeight: 500,
    wrapContent: false,
    showTabs: true,
    showConsoleButton: true,
    showInlineErrors: true,
    showNavigator: true,
  },
}: SandboxEditorProps) {
  return (
    <Sandpack
      template={template}
      files={files}
      options={editorProps}
      theme={{
        ...amethyst,
        font: {
          body: 'Fira Code, monospace',
          mono: 'Fira Code, monospace',
          size: '14px',
        },
      }}
    />
  );
}
