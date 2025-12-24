import { useState } from 'react';
import { InfographicGallery } from '@/components/InfographicGallery';
import { InfographicPlayground } from '@/components/InfographicPlayground';
import type { InfographicOptions } from '@antv/infographic';

type Page = 'gallery' | 'playground';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('gallery');
  const [playgroundConfig, setPlaygroundConfig] = useState<InfographicOptions | undefined>();
  const [playgroundTheme, setPlaygroundTheme] = useState<string>('light');

  if (currentPage === 'playground') {
    return (
      <InfographicPlayground
        onBack={() => setCurrentPage('gallery')}
        initialConfig={playgroundConfig}
        initialTheme={playgroundTheme}
      />
    );
  }

  return (
    <InfographicGallery
      onBack={() => {}}
      onNavigateToPlayground={(config, theme) => {
        setPlaygroundConfig(config);
        if (theme) setPlaygroundTheme(theme);
        setCurrentPage('playground');
      }}
    />
  );
}
