import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Individuals from './pages/Individuals';
import Conversations from './pages/Conversations';
import Search from './pages/Search';
import AuthCallback from './components/auth/AuthCallback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/companies" element={
            <Layout>
              <Companies />
            </Layout>
          } />
          <Route path="/individuals" element={
            <Layout>
              <Individuals />
            </Layout>
          } />
          <Route path="/conversations" element={
            <Layout>
              <Conversations />
            </Layout>
          } />
          <Route path="/search" element={
            <Layout>
              <Search />
            </Layout>
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
