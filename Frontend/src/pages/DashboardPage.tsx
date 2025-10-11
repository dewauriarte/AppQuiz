import { useAuthStore } from '@/store/authStore';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
}
