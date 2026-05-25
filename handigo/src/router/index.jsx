import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layouts
import MainLayout from '@/layouts/MainLayout';

// Pages
import HomePage from '@/pages/HomePage';
import LearnPage from '@/pages/LearnPage';
import DictionaryPage from '@/pages/DictionaryPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import LatihanPage from '@/pages/LatihanPage';
import ModulDetailPage from '@/pages/ModulDetailPage';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFound from '@/pages/NotFound';
import ModuleListPage from '@/pages/ModuleListPage';
import ResultPage from '@/pages/ResultPage';
import LatihanPageWithONNX from '@/pages/LatihanPageWithONNX';
import CVTestPage from '@/pages/CVTestPage';
import CompleteProfilePage from '@/pages/CompleteProfilePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'dictionary',
        element: <DictionaryPage />,
      },
      {
        path: '/modul',
        element: <ModuleListPage />,
      },
      {
        path: '/modul/:id',
        element: <ModulDetailPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      // in your router index.jsx — add this temporarily
        { path: '/cvtest', element: <CVTestPage /> },
      {
        path: '/register',
        element: <RegisterPage />,
      },
            {
        path: '/complete-profile',
        element: <CompleteProfilePage />,
      },
      {
        element: <ProtectedRoute redirectTo="/modul" message="Silakan login untuk mengakses latihan" />,
        children: [
          {
            path: 'learn',
            element: <LearnPage />,
          },
          {
            path: '/modul/:id/latihan',
            element: <LatihanPage />,
          },
          {
            // ✅ Fixed: added :id param so useParams() returns the module id
            // ✅ Fixed: moved inside ProtectedRoute so login is required
            path: '/modul/:id/latihanmode',
            element: <LatihanPageWithONNX />,
          },
          {
            path: '/modul/:id/hasil',
            element: <ResultPage />,
          },
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
        ]
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;