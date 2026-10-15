import { Navigate, Route, BrowserRouter as Router, Routes, useParams } from 'react-router-dom';
import { AttractionsProvider } from './context/AttractionsProvider';
import Loader from './components/UI/Loader';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import type { User } from 'firebase/auth';

interface MainPageRouteProps {
  user: User;
  logout: () => void;
  isAdmin?: boolean;
}

function DepartmentRoute(props: MainPageRouteProps) {
  const { departmentSlug } = useParams();
  return <MainPage {...props} initialDepartmentSlug={departmentSlug} />;
}

function App() {
  const { user, userData, isLoading, error, login, logout } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <Router basename={basename}>
      <AttractionsProvider>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage login={login} error={error} />}
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
          <Route
            path="/departamento/:departmentSlug"
            element={
              user ? (
                <DepartmentRoute
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
      </AttractionsProvider>
    </Router>
  );
}

export default App;