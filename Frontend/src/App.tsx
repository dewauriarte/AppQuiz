import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
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
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

