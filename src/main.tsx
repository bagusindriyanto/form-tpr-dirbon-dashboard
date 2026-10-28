import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { queryClient } from '@/lib/queryClient.ts';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from './components/ui/sonner.tsx';
import { TooltipProvider } from './components/ui/tooltip.tsx';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: window.localStorage,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 24 * 60 * 60 * 1000,
      }}
    >
      <TooltipProvider>
        <App />
        <Toaster richColors position="top-center" />
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      </TooltipProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
