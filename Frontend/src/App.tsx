import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import '@/styles/rarity-glow.css';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socketStore';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AIQuizGenerator from '@/pages/AIQuizGenerator';
import PreviewQuestionSetPage from '@/pages/PreviewQuestionSetPage';
import QuestionSetsPage from '@/pages/QuestionSetsPage';
import QuestionSetDetailPage from '@/pages/QuestionSetDetailPage';
import CreateQuestionSetPage from '@/pages/CreateQuestionSetPage';
import EditQuestionSetPage from '@/pages/EditQuestionSetPage';
import ClassListsPage from '@/pages/ClassListsPage';
import CreateClassListPage from '@/pages/CreateClassListPage';
import ImportClassListPage from '@/pages/ImportClassListPage';
import ClassListDetailPage from '@/pages/ClassListDetailPage';
import ClassListEditPage from '@/pages/ClassListEditPage';
import CreateGamePage from '@/pages/CreateGamePage';
import GameLobbyPage from '@/pages/GameLobbyPage';
import JoinGamePage from '@/pages/JoinGamePage';
import GamePlayPage from '@/pages/GamePlayPage';
import ProfilePage from '@/pages/ProfilePage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import { AvatarCustomization } from '@/pages/AvatarCustomization';
import { Shop } from '@/pages/Shop';
import { Inventory } from '@/pages/Inventory';
import AdminShopManagement from '@/pages/AdminShopManagement';
import AdminDashboard from '@/pages/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const { checkAuth, isAuthenticated, accessToken } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Conectar/Desconectar socket según autenticación
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup
    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  return (
    <>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-generator"
        element={
          <ProtectedRoute>
            <AIQuizGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-generator/preview"
        element={
          <ProtectedRoute>
            <PreviewQuestionSetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-sets"
        element={
          <ProtectedRoute>
            <QuestionSetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-sets/create"
        element={
          <ProtectedRoute>
            <CreateQuestionSetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-sets/:id"
        element={
          <ProtectedRoute>
            <QuestionSetDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-sets/:id/edit"
        element={
          <ProtectedRoute>
            <EditQuestionSetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists"
        element={
          <ProtectedRoute>
            <ClassListsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists/create"
        element={
          <ProtectedRoute>
            <CreateClassListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists/import"
        element={
          <ProtectedRoute>
            <ImportClassListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists/:id"
        element={
          <ProtectedRoute>
            <ClassListDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists/:id/edit"
        element={
          <ProtectedRoute>
            <ClassListEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game/create"
        element={
          <ProtectedRoute>
            <CreateGamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game/join"
        element={
          <ProtectedRoute>
            <JoinGamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game/lobby/:gameCode"
        element={
          <ProtectedRoute>
            <GameLobbyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game/play/:gameCode"
        element={
          <ProtectedRoute>
            <GamePlayPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/avatar"
        element={
          <ProtectedRoute>
            <AvatarCustomization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/shop"
        element={
          <ProtectedRoute>
            <AdminShopManagement />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    <Toaster />
    </>
  );
}

export default App;

