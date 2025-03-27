import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyForm from './components/companies/CompanyForm';
import Individuals from './pages/Individuals';
import IndividualForm from './components/individuals/IndividualForm';
import Conversations from './pages/Conversations';
import Search from './pages/Search';
import AuthCallback from './components/auth/AuthCallback';
import ConversationForm from './components/conversations/ConversationForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
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
          <Route path="/companies/new" element={
            <Layout>
              <CompanyForm />
            </Layout>
          } />
          <Route path="/companies/:id/edit" element={
            <Layout>
              <CompanyForm />
            </Layout>
          } />
          <Route path="/individuals" element={
            <Layout>
              <Individuals />
            </Layout>
          } />
          <Route path="/individuals/new" element={
            <Layout>
              <IndividualForm />
            </Layout>
          } />
          <Route path="/individuals/:id/edit" element={
            <Layout>
              <IndividualForm />
            </Layout>
          } />
          <Route path="/conversations" element={
            <Layout>
              <Conversations />
            </Layout>
          } />
          <Route path="/conversations/new" element={
            <Layout>
              <ConversationForm />
            </Layout>
          } />
          <Route path="/conversations/:id/edit" element={
            <Layout>
              <ConversationForm />
            </Layout>
          } />
          <Route path="/search" element={
            <Layout>
              <Search />
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
