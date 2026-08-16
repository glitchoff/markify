import { useMemo, useState } from 'react';
import { NavLink, useParams, Link } from 'react-router-dom';
import {
  Rocket,
  Palette,
  Sparkles,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';
import { Markify } from '@glitchoff/markify';
import gettingStarted from '../../../docs/getting-started.md?raw';
import theming from '../../../docs/theming.md?raw';
import layoutAndSizing from '../../../docs/layout-and-sizing.md?raw';
import diagramsAndMath from '../../../docs/diagrams-and-math.md?raw';
import tablesAndCallouts from '../../../docs/tables-and-callouts.md?raw';
import streaming from '../../../docs/streaming.md?raw';
import customization from '../../../docs/customization.md?raw';
import apiReference from '../../../docs/api-reference.md?raw';

const DOC_CONTENT = {
  'getting-started': gettingStarted,
  theming,
  'layout-and-sizing': layoutAndSizing,
  'diagrams-and-math': diagramsAndMath,
  'tables-and-callouts': tablesAndCallouts,
  streaming,
  customization,
  'api-reference': apiReference,
};

const GROUP_ICONS = {
  'Getting Started': Rocket,
  Styling: Palette,
  Features: Sparkles,
  Reference: BookOpen,
};

const DOC_GROUPS = [
  {
    label: 'Getting Started',
    items: [{ id: 'getting-started', title: 'Getting Started', file: 'getting-started.md' }],
  },
  {
    label: 'Styling',
    items: [
      { id: 'theming', title: 'Theming & Dark Mode', file: 'theming.md' },
      { id: 'layout-and-sizing', title: 'Layout & Sizing', file: 'layout-and-sizing.md' },
    ],
  },
  {
    label: 'Features',
    items: [
      { id: 'diagrams-and-math', title: 'Diagrams & Math', file: 'diagrams-and-math.md' },
      { id: 'tables-and-callouts', title: 'Tables & Callouts', file: 'tables-and-callouts.md' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { id: 'streaming', title: 'Streaming Guide', file: 'streaming.md' },
      { id: 'customization', title: 'Customization', file: 'customization.md' },
      { id: 'api-reference', title: 'API Reference', file: 'api-reference.md' },
    ],
  },
];

const FLAT_ITEMS = DOC_GROUPS.flatMap(g => g.items);

function SidebarNav({ collapsed, onNavigate }) {
  return (
    <nav className="flex flex-col gap-4">
      {DOC_GROUPS.map(group => {
        const GroupIcon = GROUP_ICONS[group.label];
        return (
          <div key={group.label}>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title={collapsed ? group.label : undefined}
            >
              <GroupIcon className="size-3.5 shrink-0" />
              {!collapsed && <span>{group.label}</span>}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map(doc => (
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
                      <FileText className="size-4 shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{doc.title}</span>}
                      {!collapsed && isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
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
      className={`sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-sm transition-[width] duration-200 ${
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

  const selectedIndex = useMemo(
    () => Math.max(0, FLAT_ITEMS.findIndex(d => d.id === docId)),
    [docId],
  );
  const selectedDoc = FLAT_ITEMS[selectedIndex];
  const prevDoc = FLAT_ITEMS[selectedIndex - 1];
  const nextDoc = FLAT_ITEMS[selectedIndex + 1];

  return (
    <div className="flex w-full items-start gap-6">
      {/* Mobile navigation header */}
      <div className="fixed inset-x-0 top-16 z-30 px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm"
          type="button"
        >
          <div className="flex items-center gap-2 truncate">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
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

      {/* Left sidebar (desktop) — flush left */}
      <aside className="hidden md:block pl-4">
        <SidebarCard collapsed={collapsed} setCollapsed={setCollapsed}>
          <SidebarNav collapsed={collapsed} />
        </SidebarCard>
      </aside>

      {/* Centered content — 80% width, scrolls independently */}
      <div className="min-w-0 flex-1 md:pt-0 pt-24">
        <div className="mx-auto max-h-[calc(100vh-6rem)] w-[80%] max-w-5xl overflow-y-auto pr-1">
          <div className="mb-4 hidden md:flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
            <span className="font-mono">docs/{selectedDoc.file}</span>
            <span className="text-[11px]">Rendered with Markify</span>
          </div>

          <Markify hljsTheme={isDark ? 'dark' : 'light'}>
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