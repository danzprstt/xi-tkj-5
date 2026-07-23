import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import EditPage from './pages/EditPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/edit-dengan-keamanan-key" element={<EditPage />} />
      </Routes>
    </BrowserRouter>
  );
}
