import {
  useSandpackNavigation,
  UnstyledOpenInCodeSandboxButton,
} from '@codesandbox/sandpack-react';
import {
  RefreshIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  CodeIcon,
  ClearIcon,
  ExternalIcon,
} from './icons';

export type Tab = 'preview' | 'console';

interface PreviewTabsProps {
  selectedTab: Tab;
  onTabSelect: (tab: Tab) => void;
  onClear: () => void;
  isFullscreen: boolean;
  onFullscreen: () => void;
  showCode: boolean;
  onToggleCode: () => void;
}

export function PreviewTabs({
  selectedTab,
  onTabSelect,
  onClear,
  isFullscreen,
  onFullscreen,
  showCode,
  onToggleCode,
}: PreviewTabsProps) {
  const { refresh } = useSandpackNavigation();

  return (
    <div className="preview-tabs-header">
      <div className="preview-tabs">
        <button
          className={selectedTab === 'preview' ? 'active' : ''}
          onClick={() => onTabSelect('preview')}
        >
          Preview
        </button>
        <button
          className={selectedTab === 'console' ? 'active' : ''}
          onClick={() => onTabSelect('console')}
        >
          Console
        </button>
      </div>

      <div className="preview-actions">
        <button
          onClick={onToggleCode}
          title={showCode ? 'Hide code' : 'Show code'}
          aria-label={showCode ? 'Hide code' : 'Show code'}
        >
          <CodeIcon />
        </button>

        {selectedTab === 'preview' && (
          <>
            <button
              onClick={onFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
            <button onClick={refresh} title="Refresh preview" aria-label="Refresh preview">
              <RefreshIcon />
            </button>
            <UnstyledOpenInCodeSandboxButton
              title="Open in CodeSandbox"
              aria-label="Open in CodeSandbox"
              className="preview-action-button"
            >
              <ExternalIcon />
            </UnstyledOpenInCodeSandboxButton>
          </>
        )}

        {selectedTab === 'console' && (
          <button onClick={onClear} title="Clear console" aria-label="Clear console">
            <ClearIcon />
          </button>
        )}
      </div>
    </div>
  );
}
