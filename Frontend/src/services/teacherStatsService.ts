import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface TeacherStats {
  totalQuizzes: number;
  activeGames: number;
  totalStudents: number;
  averageAccuracy: number;
  recentQuizzes: Array<{
    set_id: number;
    title: string;
    question_count: number;
    times_played: number;
    created_at: string;
  }>;
  recentGames: Array<{
    game_id: number;
    game_code: string;
    status: string;
    player_count: number;
    created_at: string;
  }>;
}

export async function getTeacherStats(userId: number, token: string): Promise<TeacherStats> {
  const response = await axios.get(`${API_BASE}/teachers/${userId}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

