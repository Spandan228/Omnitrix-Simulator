import React from 'react'
import { OmnitrixApp } from '@/components/omnitrix';
import { ThemeProvider } from '@/context/ThemeProvider';
import { useOmnitrix } from '@/hooks/useOmnitrix';

// Extract a wrapper to provide the state to ThemeProvider
const OmnitrixAppWrapper = () => {
  const omnitrix = useOmnitrix();
  return (
    <ThemeProvider omnitrixState={omnitrix.state}>
      <OmnitrixApp omnitrix={omnitrix} />
    </ThemeProvider>
  );
};

function App() {
  return (
    <>
      <OmnitrixAppWrapper />
    </>
  )
}

export default App
