import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './components/Auth/AuthPage';
import TodoPage from './pages/TodoPage';
import './index.css';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated ? <TodoPage /> : <AuthPage />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;