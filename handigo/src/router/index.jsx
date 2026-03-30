import { createBrowserRouter } from 'react-router-dom';

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

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // MainLayout provides the BottomNavBar
    errorElement: <NotFound />, // basic catch if something inside fails routing, or we use a root error boundary
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'learn',
        element: <LearnPage />,
      },
      {
        path: 'dictionary',
        element: <DictionaryPage />,
      },
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
      {
        path: 'latihan',
        element: <LatihanPage />,
      },
      {
        path: 'modul/:id',
        element: <ModulDetailPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;
