import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Loader from './components/UI/Loader';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';

function App() {
  const { user, userData, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage login={login} />}
        />
        <Route
          path="/"
          element={
            user ? (
              <MainPage
                user={user}
                logout={logout}
                isAdmin={userData?.isAdmin}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;