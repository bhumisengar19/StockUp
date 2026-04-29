import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './context/ThemeContext';
import { initInteractions } from './utils/interactions';
import GlobalBackground from './components/GlobalBackground';
import AppRoutes from './routes/AppRoutes';

/**
 * Root Application Component.
 * Orchestrates global providers (Theme, Auth) and the visual environment.
 */
export default function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    // Check user session status on initial load
    checkAuth();
    
    // Initialize premium interaction engine (parallax, magnetic effects, etc)
    initInteractions();
  }, [checkAuth]);

  return (
    <ThemeProvider>
      {/* Immersive environmental background system */}
      <GlobalBackground />

      <Router>
        {/* Centralized routing logic */}
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

