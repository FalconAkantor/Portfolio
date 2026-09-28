import { StrictMode } from 'react';
import { I18nProvider, useI18n } from './i18n/context';
import type { Lang } from './i18n/types';
import { ModeProvider, type Mode } from './lib/mode';
import { useActiveSection } from './hooks/useActiveSection';
import { BootSequence } from './components/boot/BootSequence';
import { ModeChooser } from './components/chooser/ModeChooser';
import { LiteSite } from './lite/LiteSite';
import { StatusBar } from './components/navigation/StatusBar';
import { SystemTree } from './components/navigation/SystemTree';
import { MobileDock } from './components/navigation/MobileDock';
import { Footer } from './components/navigation/Footer';
import { TerminalDrawer } from './components/terminal/TerminalDrawer';
import { Hero } from './sections/Hero';
import { Projects } from './sections/Projects';
import { Network } from './sections/Network';
import { Automation } from './sections/Automation';
import { Stack } from './sections/Stack';
import { About } from './sections/About';
import { Contact } from './sections/Contact';
import './styles/layout.css';

export function App({ lang, mode }: { lang: Lang; mode: Mode }) {
  return (
    <StrictMode>
      <I18nProvider lang={lang}>
        <ModeProvider mode={mode}>{mode === 'lite' ? <LiteSite /> : <Shell />}</ModeProvider>
      </I18nProvider>
    </StrictMode>
  );
}

function Shell() {
  const { t } = useI18n();
  const active = useActiveSection();

  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skip}
      </a>
      <ModeChooser />
      <BootSequence />
      <StatusBar active={active} />

      <aside className="rail">
        <SystemTree active={active} label={t.a11y.systemMap} />
        <div className="rail__foot">
          <span>
            <kbd>⌘K</kbd> / <kbd>`</kbd> terminal
          </span>
          <span>{t.status.nominal}</span>
        </div>
      </aside>

      <div className="shell">
        <main id="main" className="main" tabIndex={-1}>
          <Hero />
          <Projects />
          <Network />
          <Automation />
          <Stack />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>

      <MobileDock active={active} />
      <TerminalDrawer />
    </>
  );
}
