import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import EditPage from './pages/EditPage.jsx';
import PrivateAdminPage from './pages/PrivateAdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/edit-dengan-keamanan-key" element={<EditPage />} />
        <Route path="/private-pr-kelas" element={<PrivateAdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
