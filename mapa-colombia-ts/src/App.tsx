import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';

function App() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900">
        Verificando sesión...
      </div>
    );
  }

  // El ThemeToggle ya no se renderiza aquí. Su lógica está en UserDropdown,
  // que es renderizado por MainPage.
  return user ? <MainPage user={user} logout={logout} /> : <LoginPage login={login} />;
}

export default App;
