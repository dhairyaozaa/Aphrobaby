import { About } from './components/About';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Hero } from './components/Hero';
import { Keepsake } from './components/Keepsake';
import { Kingdom } from './components/Kingdom';
import { LifeClock } from './components/LifeClock';
import { Nav } from './components/Nav';
import { SettingsPanel } from './components/SettingsPanel';
import { Stats } from './components/Stats';
import { Timeline } from './components/Timeline';
import { Toasts } from './components/Toasts';
import { useStore } from './state/Store';

export default function App() {
  const { keepsakeOpen } = useStore();

  return (
    <>
      <a className="skip-link" href="#life">
        Skip to her life clock
      </a>
      <Nav />
      <main>
        <Hero />
        <LifeClock />
        <Stats />
        <Timeline />
        <Kingdom />
        <Gallery />
        <About />
      </main>
      <Footer />
      <SettingsPanel />
      {keepsakeOpen ? <Keepsake /> : null}
      <ConfirmDialog />
      <Toasts />
    </>
  );
}
