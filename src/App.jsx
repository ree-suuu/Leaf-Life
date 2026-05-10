import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Marketplace from './pages/Marketplace';
import Scan from './pages/Scan';
import Rewards from './pages/Rewards';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Purchase from './pages/Purchase';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/purchase/:id" element={<Purchase />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;