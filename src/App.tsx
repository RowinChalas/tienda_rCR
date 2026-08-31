// src/App.tsx — Router raíz: Tienda Pública ↔ Panel de Administración
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StorefrontLayout } from './pages/StorefrontLayout';
import { AppLayout } from './app/AppLayout';

type AppView = 'storefront' | 'admin';

const App: React.FC = () => {
  const [appView, setAppView] = useState<AppView>('storefront');

  return (
    <AnimatePresence mode="wait">
      {appView === 'storefront' ? (
        <motion.div
          key="storefront"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <StorefrontLayout onGoAdmin={() => setAppView('admin')} />
        </motion.div>
      ) : (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-root"
        >
          <AppLayout onGoStorefront={() => setAppView('storefront')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
