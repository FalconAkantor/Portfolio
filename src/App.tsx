import { StrictMode } from 'react';
import { I18nProvider, useI18n } from './i18n/context';
import type { Lang } from './i18n/types';
import { useActiveSection } from './hooks/useActiveSection';
import { BootSequence } from './components/boot/BootSequence';
import { StatusBar } from './components/navigation/StatusBar';
import { SystemTree } from './components/navigation/SystemTree';
import { MobileDock } from './components/navigation/MobileDock';
import { Footer } from './components/navigation/Footer';
import { TerminalDrawer } from './components/terminal/TerminalDrawer';
import { Hero } from './sections/Hero';
import { Manifesto } from './sections/Manifesto';
import { Network } from './sections/Network';
import { Projects } from './sections/Projects';
import { AiLab } from './sections/AiLab';
import { Vision } from './sections/Vision';
import { Automation } from './sections/Automation';
import { Infrastructure } from './sections/Infrastructure';
import { Stack } from './sections/Stack';
import { Operator } from './sections/Operator';
import { Contact } from './sections/Contact';
import './styles/layout.css';

export function App({ lang }: { lang: Lang }) {
  return (
    <StrictMode>
      <I18nProvider lang={lang}>
        <Shell />
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
          <Manifesto />
          <Network />
          <Projects />
          <AiLab />
          <Vision />
          <Automation />
          <Infrastructure />
          <Stack />
          <Operator />
          <Contact />
        </main>
        <Footer />
      </div>

      <MobileDock active={active} />
      <TerminalDrawer />
    </>
  );
}
