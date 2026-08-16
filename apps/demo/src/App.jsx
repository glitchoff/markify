import { useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Demo } from './Demo';
import { Docs } from './Docs';
import { Playground } from './Playground';
import { useTheme } from './hooks/useTheme';
import logoDarkUrl from '../../../src/public/markify-icon-dark.svg?url';
import logoLightUrl from '../../../src/public/markify-icon-light.svg?url';
import 'katex/dist/katex.min.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const navLinkClass = ({ isActive }) =>
  `rounded px-3 py-1 font-medium transition-all ${
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
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-3">
            {/* Logo & Brand */}
            <NavLink to="/" className="flex items-center gap-3">
              <img
                src={isDark ? logoDarkUrl : logoLightUrl}
                alt="Markify logo"
                className="h-9 w-9 rounded-lg"
                width={512}
                height={512}
              />
              <span className="text-lg font-semibold tracking-tight">Markify</span>
            </NavLink>

            {/* Navigation Tabs & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border bg-muted p-1 text-xs">
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
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                type="button"
                title="Toggle dark / light mode"
              >
                {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <a
                href="https://github.com/glitchoff/markify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>

        <main className="w-full py-10">
          <Routes>
            <Route path="/" element={<Demo isDark={isDark} />} />
            <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
            <Route path="/docs/:docId" element={<Docs isDark={isDark} />} />
            <Route path="/playground" element={<Playground isDark={isDark} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;