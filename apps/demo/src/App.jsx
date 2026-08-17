import { useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import logoDarkUrl from '../../../src/public/markify-icon-dark.svg?url';
import logoLightUrl from '../../../src/public/markify-icon-light.svg?url';
import 'katex/dist/katex.min.css';

const Demo = lazy(() => import('./Demo').then(m => ({ default: m.Demo })));
const Docs = lazy(() => import('./Docs').then(m => ({ default: m.Docs })));
const Playground = lazy(() => import('./Playground').then(m => ({ default: m.Playground })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const navLinkClass = ({ isActive }) =>
  `rounded px-2 py-1 font-medium transition-all sm:px-3 ${
    isActive
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground'
  }`;

function App() {
  const { isDark, toggle } = useTheme();

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
            {/* Logo & Brand */}
            <NavLink to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
              <img
                src={isDark ? logoDarkUrl : logoLightUrl}
                alt="Markify logo"
                className="h-8 w-8 rounded-lg sm:h-9 sm:w-9"
                width={512}
                height={512}
              />
              <span className="hidden text-lg font-semibold italic tracking-tight sm:block">Markify</span>
            </NavLink>

            {/* Navigation Tabs & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center rounded-lg border border-border bg-muted p-0.5 text-xs sm:p-1">
                <NavLink to="/" end className={navLinkClass}>
                  Demo
                </NavLink>
                <NavLink to="/docs/getting-started" className={navLinkClass}>
                  Docs
                </NavLink>
                <NavLink to="/playground" className={navLinkClass}>
                  Playground
                </NavLink>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors sm:px-2.5"
                type="button"
                title="Toggle dark / light mode"
              >
                {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                <span className="hidden sm:block">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <a
                href="https://github.com/glitchoff/markify"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-xs font-medium text-muted-foreground hover:text-foreground transition-colors md:block"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>

        <main className="w-full py-10">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
                Loading...
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Demo isDark={isDark} />} />
              <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
              <Route path="/docs/:docId" element={<Docs isDark={isDark} />} />
              <Route path="/playground" element={<Playground isDark={isDark} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;