import Loader from './components/UI/Loader';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';

function App() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <Loader />
  }
  return user ? <MainPage user={user} logout={logout} /> : <LoginPage login={login} />;
}

export default App;
