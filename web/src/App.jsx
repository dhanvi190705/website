import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Crown, LibraryBig, SquareKanban } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AiSupportWidget from './components/assistant/AiSupportWidget';
import AmbientBackground from './components/layout/AmbientBackground';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import ChampionWorkspace from './sections/ChampionWorkspace';
import ExecutiveDashboard from './sections/ExecutiveDashboard';
import PioneerVision from './sections/PioneerVision';
import ResourceVault from './sections/ResourceVault';
import useAsync from './hooks/useAsync';
import api from './lib/api';
import { programmeSummary } from './lib/analytics';
import { currentUser } from './data/mockData';

const TABS = [
  { id: 'vision', label: 'Pioneer Vision', icon: Crown },
  { id: 'workspace', label: 'Workspace', icon: SquareKanban },
  { id: 'vault', label: 'Vault', icon: LibraryBig },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

const VALID_TABS = TABS.map((t) => t.id);

export default function App() {
  // The hash is the router — deep links and browser back both work without
  // pulling in a routing library for four panels.
  const [tab, setTab] = useState(() => {
    const fromHash = window.location.hash.replace('#', '');
    return VALID_TABS.includes(fromHash) ? fromHash : 'vision';
  });

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '');
      if (VALID_TABS.includes(next)) setTab(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const changeTab = (id) => {
    setTab(id);
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dashboard = useAsync(() => api.getDashboard(), []);
  const workspace = useAsync(() => api.getWorkspace(currentUser.id), []);
  const session = useAsync(() => api.getSession(), []);

  const user = session.data?.user || currentUser;

  // The hero scoreboard reads the same aggregation the dashboard does.
  const heroStats = useMemo(() => {
    const projects = dashboard.data?.projects || [];
    const champions = dashboard.data?.champions || [];
    if (!projects.length) return [];
    const s = programmeSummary(projects, champions);
    return [
      { value: s.totalChampions + s.totalSpecialists, label: 'Batch 01 cohort', hint: 'champions and specialists' },
      { value: s.totalProjects, label: 'Projects opened', hint: `across ${s.departments} departments` },
      { value: s.milestones, label: 'Milestones cleared', hint: 'since September' },
      { value: s.shipped, label: 'In production', hint: `${s.shippedShare}% of the pipeline` },
    ];
  }, [dashboard.data]);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[70] focus:rounded-lg focus:bg-gold-gradient focus:px-4 focus:py-2.5 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.16em] focus:text-ink"
      >
        Skip to content
      </a>

      <Header
        tabs={TABS}
        activeTab={tab}
        onTabChange={changeTab}
        user={user}
        status={`${user.batch} · Active`}
      />

      <main id="main" className="relative z-10 mx-auto max-w-[1400px] px-5 pt-[68px] md:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'vision' && <PioneerVision summary={heroStats} />}
            {tab === 'workspace' && <ChampionWorkspace workspace={workspace.data} user={user} />}
            {tab === 'vault' && <ResourceVault />}
            {tab === 'dashboard' && <ExecutiveDashboard dashboard={dashboard.data} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <AiSupportWidget />
    </div>
  );
}
