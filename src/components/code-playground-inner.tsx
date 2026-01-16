import { useState, useEffect, useRef } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import { PreviewTabs, type Tab } from './sandpack/preview-tabs';
import { CustomRunButton } from './sandpack/custom-run-button';
import type { SandboxEditorProps } from './code-playground';

// Custom theme matching github-dark-default (used by Expressive Code)
const githubDarkDefault = {
  colors: {
    surface1: '#0d1117',
    surface2: '#161b22',
    surface3: '#21262d',
    clickable: '#7d8590',
    base: '#e6edf3',
    disabled: '#6e7681',
    hover: '#e6edf3',
    accent: '#2f81f7',
    error: '#f85149',
    errorSurface: '#490202',
  },
  syntax: {
    plain: '#e6edf3',
    comment: { color: '#8b949e', fontStyle: 'italic' as const },
    keyword: '#ff7b72',
    tag: '#7ee787',
    punctuation: '#e6edf3',
    definition: '#d2a8ff',
    property: '#79c0ff',
    static: '#79c0ff',
    string: '#a5d6ff',
  },
  font: {
    body: 'MonoLisa, monospace',
    mono: 'MonoLisa, monospace',
    size: '14px',
    lineHeight: '20px',
  },
};

export default function CodePlaygroundInner({
  files,
  template = 'react-ts',
  customSetup,
  autorun = true,
  defaultTab = 'preview',
  editorHeight = 500,
}: SandboxEditorProps) {
  const [selectedTab, setSelectedTab] = useState<Tab>(defaultTab);
  const [consoleKey, setConsoleKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 960);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Remove focus outline from Sandpack tabs after click
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if clicked element is a tab button
      if (target.closest('[data-active]') || target.closest('.sp-tab-button')) {
        // Blur after a short delay to allow the click to register
        requestAnimationFrame(() => {
          (document.activeElement as HTMLElement)?.blur();
        });
      }
    };

    wrapper.addEventListener('mousedown', handleMouseDown);
    return () => wrapper.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleClearConsole = () => setConsoleKey((k) => k + 1);

  const handleFullscreen = () => {
    setIsFullscreen((prev) => {
      document.body.style.overflow = prev ? 'auto' : 'hidden';
      return !prev;
    });
  };

  const handleToggleCode = () => setShowCode((prev) => !prev);

  // On mobile, let CSS control the heights; on desktop, use prop values
  const height = isFullscreen ? '100dvh' : isMobile ? undefined : editorHeight;
  const contentHeight =
    height === undefined
      ? 'calc(100% - 40px)'
      : typeof height === 'number'
        ? height - 40
        : `calc(${height} - 40px)`;
  const shouldAutorun = autorun && !isMobile;

  return (
    <div ref={wrapperRef} className={`sandpack-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <SandpackProvider
        template={template}
        theme={githubDarkDefault}
        files={files}
        customSetup={customSetup}
        options={{ autorun: shouldAutorun }}
      >
        <SandpackLayout>
          {showCode && (
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showRunButton={false}
              style={{ height }}
            />
          )}

          <div className="preview-panel" style={{ height }}>
            {!shouldAutorun && (
              <div className="run-button-overlay">
                <CustomRunButton />
              </div>
            )}

            <PreviewTabs
              selectedTab={selectedTab}
              onTabSelect={setSelectedTab}
              onClear={handleClearConsole}
              isFullscreen={isFullscreen}
              onFullscreen={handleFullscreen}
              showCode={showCode}
              onToggleCode={handleToggleCode}
            />

            <SandpackConsole
              key={consoleKey}
              showHeader={false}
              style={{
                height: contentHeight,
                display: selectedTab === 'console' ? 'flex' : 'none',
              }}
            />

            <SandpackPreview
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              style={{
                height: contentHeight,
                display: selectedTab === 'preview' ? 'flex' : 'none',
              }}
            />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
