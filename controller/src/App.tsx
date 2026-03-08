import React, { useState } from 'react';
import { useQueue } from './hooks/useQueue';
import BottomNav, { Tab } from './components/BottomNav';
import NowPlayingBar from './components/NowPlayingBar';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import QueueScreen from './screens/QueueScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { queueState, addToQueue, removeFromQueue, skip, pause, resume } = useQueue();

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
  }

  return (
    <div style={styles.app}>
      <div style={styles.content}>
        {activeTab === 'home' && (
          <HomeScreen
            queueState={queueState}
            onGoSearch={() => setActiveTab('search')}
          />
        )}
        {activeTab === 'search' && (
          <SearchScreen onAdd={addToQueue} />
        )}
        {activeTab === 'queue' && (
          <QueueScreen
            queueState={queueState}
            onRemove={removeFromQueue}
          />
        )}
      </div>
      <NowPlayingBar
        queueState={queueState}
        onSkip={skip}
        onPause={pause}
        onResume={resume}
      />
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        queueCount={queueState.queue.length}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0014',
    fontFamily: 'system-ui, sans-serif',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
};
