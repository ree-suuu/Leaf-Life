import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Marketplace from './pages/Marketplace';
import Scan from './pages/Scan';
import Rewards from './pages/Rewards';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="scan" element={<Scan />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
