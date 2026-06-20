import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TabBar } from '@/components/Layout/TabBar';
import Dashboard from '@/pages/Dashboard';
import PendingPage from '@/pages/PendingPage';
import ConfirmedPage from '@/pages/ConfirmedPage';
import FollowupPage from '@/pages/FollowupPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <TabBar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pending" element={<PendingPage />} />
            <Route path="/confirmed" element={<ConfirmedPage />} />
            <Route path="/followup" element={<FollowupPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
