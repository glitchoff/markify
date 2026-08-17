import { useMemo, useState } from 'react';
import { NavLink, useParams, Link } from 'react-router-dom';
import {
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Compass,
  Ruler,
  Type,
  Sigma,
  Workflow,
  ChessKnight,
  Table,
  MessageSquareQuote,
  Image,
  Video,
  Activity,
  Settings2,
  Code2,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Copy,
  Check,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { Markify } from '@glitchoff/markify';
import gettingStarted from '../../../docs/getting-started.md?raw';
import theming from '../../../docs/theming.md?raw';
import layoutAndSizing from '../../../docs/layout-and-sizing.md?raw';
import styling from '../../../docs/styling.md?raw';
import diagramsAndMath from '../../../docs/diagrams-and-math.md?raw';
import mermaid from '../../../docs/mermaid.md?raw';
import tablesAndCallouts from '../../../docs/tables-and-callouts.md?raw';
import calloutsAndBlockquotes from '../../../docs/callouts-and-blockquotes.md?raw';
import images from '../../../docs/images.md?raw';
import embeds from '../../../docs/embeds.md?raw';
import streaming from '../../../docs/streaming.md?raw';
import chess from '../../../docs/chess.md?raw';
import customization from '../../../docs/customization.md?raw';
import apiReference from '../../../docs/api-reference.md?raw';

const DOC_CONTENT = {
  'getting-started': gettingStarted,
  theming,
  'layout-and-sizing': layoutAndSizing,
  styling,
  'diagrams-and-math': diagramsAndMath,
  mermaid,
  'tables-and-callouts': tablesAndCallouts,
  'callouts-and-blockquotes': calloutsAndBlockquotes,
  images,
  embeds,
  streaming,
  chess,
  customization,
  'api-reference': apiReference,
};

const DOC_GROUPS = [
  {
    label: 'Getting Started',
    items: [{ id: 'getting-started', title: 'Getting Started', file: 'getting-started.md', icon: Compass }],
  },
  {
    label: 'Styling',
    items: [
      { id: 'theming', title: 'Theming & Dark Mode', file: 'theming.md', icon: Palette },
      { id: 'layout-and-sizing', title: 'Layout & Sizing', file: 'layout-and-sizing.md', icon: Ruler },
      { id: 'styling', title: 'Styling & Spacing', file: 'styling.md', icon: Type },
    ],
  },
  {
    label: 'Features',
    items: [
      { id: 'diagrams-and-math', title: 'Math (KaTeX)', file: 'diagrams-and-math.md', icon: Sigma },
      { id: 'mermaid', title: 'Mermaid Diagrams', file: 'mermaid.md', icon: Workflow },
      { id: 'chess', title: 'Chess (PGN)', file: 'chess.md', icon: ChessKnight },
      { id: 'tables-and-callouts', title: 'Tables', file: 'tables-and-callouts.md', icon: Table },
      { id: 'callouts-and-blockquotes', title: 'Callouts & Blockquotes', file: 'callouts-and-blockquotes.md', icon: MessageSquareQuote },
      { id: 'images', title: 'Images', file: 'images.md', icon: Image },
      { id: 'embeds', title: 'Video Embeds', file: 'embeds.md', icon: Video },
    ],
  },
  {
    label: 'Reference',
    items: [
      { id: 'streaming', title: 'Streaming Guide', file: 'streaming.md', icon: Activity },
      { id: 'customization', title: 'Customization', file: 'customization.md', icon: Settings2 },
      { id: 'api-reference', title: 'API Reference', file: 'api-reference.md', icon: Code2 },
    ],
  },
];

const FLAT_ITEMS = DOC_GROUPS.flatMap(g => g.items);

function SidebarNav({ collapsed, onNavigate }) {
  return (
    <nav className="flex flex-col gap-4">
      {DOC_GROUPS.map(group => {
        return (
          <div key={group.label}>
            <div
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ${
                collapsed ? 'text-center px-0' : ''
              }`}
              title={collapsed ? group.label : undefined}
            >
              {!collapsed && <span>{group.label}</span>}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map(doc => {
                const DocIcon = doc.icon || FileText;
                return (
                <NavLink
                  key={doc.id}
                  to={`/docs/${doc.id}`}
                  onClick={onNavigate}
                  title={collapsed ? doc.title : undefined}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors text-left ${
                      collapsed ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <DocIcon className="size-4 shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{doc.title}</span>}
                      {!collapsed && isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarCard({ collapsed, setCollapsed, children }) {
  return (
    <div
      className={`fixed top-20 left-4 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-sm transition-[width] duration-200 z-20 ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      <div
        className={`mb-2 flex items-center border-b border-border pb-2 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <span className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Docs
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          type="button"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>
      {children}
    </div>
  );
}

export function Docs({ isDark }) {
  const { docId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [docMenuOpen, setDocMenuOpen] = useState(false);

  const selectedIndex = useMemo(
    () => Math.max(0, FLAT_ITEMS.findIndex(d => d.id === docId)),
    [docId],
  );
  const selectedDoc = FLAT_ITEMS[selectedIndex];
  const prevDoc = FLAT_ITEMS[selectedIndex - 1];
  const nextDoc = FLAT_ITEMS[selectedIndex + 1];

  return (
    <div className="flex w-full h-[calc(100dvh-80px)] overflow-hidden md:h-[calc(100vh-140px)]">
      {/* Mobile navigation header */}
      <div className="fixed inset-x-0 top-16 z-30 px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm"
          type="button"
        >
          <div className="flex items-center gap-2 truncate">
            {(() => { const DocIcon = selectedDoc.icon || FileText; return <DocIcon className="size-4 shrink-0 text-muted-foreground" />; })()}
            <span className="truncate">{selectedDoc.file}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span>Menu</span>
          </span>
        </button>
        {mobileMenuOpen && (
          <div className="mt-2 rounded-xl border border-border bg-card p-2 shadow-lg animate-in fade-in duration-150">
            <SidebarNav collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>

      {/* Left sidebar (desktop): fixed position */}
      <aside className="hidden md:block">
        <SidebarCard collapsed={collapsed} setCollapsed={setCollapsed}>
          <SidebarNav collapsed={collapsed} />
        </SidebarCard>
      </aside>

      {/* Centered content: fills remaining space, only this scrolls */}
      <div className={`min-w-0 flex-1 md:pt-0 pt-6 overflow-hidden ${collapsed ? 'md:pl-[4.5rem]' : 'md:pl-[17rem]'}`}>
        <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto px-4 md:w-[80%] md:px-0 md:pr-1 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3 text-xs text-muted-foreground">
            <span className="min-w-0 truncate font-mono">docs/{selectedDoc.file}</span>
            <div className="flex shrink-0 items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setDocMenuOpen(o => !o)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                >
                  {copiedDoc ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedDoc ? 'Copied!' : 'Copy'}
                  <ChevronDown className="size-3" />
                </button>
                {docMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDocMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                      <button
                        onClick={() => {
                          const content = DOC_CONTENT[selectedDoc.id] || gettingStarted;
                          navigator.clipboard.writeText(content).then(() => {
                            setCopiedDoc(true);
                            setTimeout(() => setCopiedDoc(false), 2000);
                          });
                          setDocMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        type="button"
                      >
                        <Copy className="size-3.5" />
                        Copy markdown
                      </button>
                      <div className="border-t border-border" />
                      <a
                        href={`https://chatgpt.com/?${new URLSearchParams({ hints: 'search', prompt: DOC_CONTENT[selectedDoc.id] || gettingStarted })}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDocMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                        Open in ChatGPT
                      </a>
                      <a
                        href={`https://claude.ai/new?${new URLSearchParams({ q: DOC_CONTENT[selectedDoc.id] || gettingStarted })}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDocMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                        Open in Claude
                      </a>
                    </div>
                  </>
                )}
              </div>
              <span className="text-[11px]">Rendered with Markify</span>
            </div>
          </div>

          <Markify hljsTheme={isDark ? 'dark' : 'light'} chessEnabled youtubeEnabled>
            {DOC_CONTENT[selectedDoc.id] || gettingStarted}
          </Markify>

          {/* Prev / Next pagination */}
          <div className="mt-10 pt-4 border-t border-border flex items-center justify-between gap-4">
            {prevDoc ? (
              <Link
                to={`/docs/${prevDoc.id}`}
                className="group flex-1 flex flex-col gap-0.5 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted"
              >
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <ArrowLeft className="size-3" />
                  Previous
                </span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {prevDoc.title}
                </span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
            {nextDoc && (
              <Link
                to={`/docs/${nextDoc.id}`}
                className="group flex-1 flex flex-col items-end gap-0.5 rounded-lg border border-border bg-card px-4 py-3 text-right transition-colors hover:border-primary/50 hover:bg-muted"
              >
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Next
                  <ArrowRight className="size-3" />
                </span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {nextDoc.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}