import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  Loader2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface QuestionSet {
  set_id: number;
  title: string;
  description: string | null;
  subject: string;
  grade_level: string | null;
  difficulty: string;
  is_public: boolean;
  total_questions: number;
  created_at: string;
  users: {
    user_id: number;
    username: string;
    display_name: string | null;
  };
  _count: {
    questions: number;
  };
}

export default function QuestionSetsPage() {
  const navigate = useNavigate();
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadQuestionSets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (search) params.append('search', search);
      if (difficulty !== 'all') params.append('difficulty', difficulty);

      const { data } = await api.get(`/question-sets?${params.toString()}`);
      setQuestionSets(data.data);
      setTotal(data.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error loading question sets:', error);
      toast.error('Error al cargar los quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionSets();
  }, [page, difficulty]);

  const handleSearch = () => {
    setPage(1);
    loadQuestionSets();
  };

  const handleDeleteClick = (setId: number) => {
    setDeletingQuizId(setId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingQuizId) return;

    try {
      setIsDeleting(true);
      await api.delete(`/question-sets/${deletingQuizId}`);
      toast.success('Quiz eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingQuizId(null);
      loadQuestionSets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar el quiz');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingQuizId(null);
  };

  const handleDuplicate = async (setId: number) => {
    try {
      await api.post(`/question-sets/${setId}/duplicate`);
      toast.success('Quiz duplicado exitosamente');
      loadQuestionSets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al duplicar el quiz');
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'hard':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getDifficultyText = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Medio';
      case 'hard':
        return 'Difícil';
      default:
        return diff;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')} 
            className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="game-card bg-gradient-to-br from-blue-900 to-cyan-900 rounded-xl p-6 border-2 border-blue-500 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center level-badge shadow-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-gaming text-white">
                    MIS QUIZZES
                  </h1>
                  <p className="text-blue-200">
                    Gestiona y organiza tus desafíos educativos
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/ai-generator')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  IA Mágica
                </Button>
                <Button
                  onClick={() => navigate('/question-sets/create')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Quiz
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-800 border-2 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por título o descripción..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                    <Button onClick={handleSearch} variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-slate-900 text-white border-purple-500/50">
                      <SelectValue placeholder="Dificultad" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-500 text-white">
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question Sets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : questionSets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-gaming text-white mb-2">
                  NO HAY QUIZZES AÚN
                </h3>
                <p className="text-gray-400 mb-6">
                  Crea tu primer quiz o usa la IA Mágica para generar uno automáticamente
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/ai-generator')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    IA Mágica
                  </Button>
                  <Button
                    onClick={() => navigate('/question-sets/create')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionSets.map((set, index) => (
              <motion.div
                key={set.set_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Card className="bg-slate-800 border-2 border-blue-500/30 hover:border-blue-500 transition-all game-card group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white font-gaming text-lg mb-2">
                          {set.title}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">
                          {set.description || 'Sin descripción'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={getDifficultyColor(set.difficulty)}>
                        {getDifficultyText(set.difficulty)}
                      </Badge>
                      <Badge className="bg-blue-600">
                        {set._count.questions} preguntas
                      </Badge>
                      {set.is_public && (
                        <Badge className="bg-green-600">Público</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-400 mb-4">
                      <p>📚 {set.subject}</p>
                      {set.grade_level && <p>🎓 {set.grade_level}</p>}
                      <p>👤 {set.users.display_name || set.users.username}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/question-sets/${set.set_id}`)}
                        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/question-sets/${set.set_id}/edit`)}
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(set.set_id)}
                        className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(set.set_id)}
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Borrar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 12 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center gap-2"
          >
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-white font-gaming">
              Página {page} de {Math.ceil(total / 12)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
            >
              Siguiente
            </Button>
          </motion.div>
        )}
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-2 border-red-500/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-gaming text-2xl text-red-400 flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              ELIMINAR QUIZ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              ¿Estás seguro de que deseas eliminar este quiz?
              {deletingQuizId && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-red-500/30">
                  <p className="text-white font-medium">
                    {questionSets.find(q => q.set_id === deletingQuizId)?.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {questionSets.find(q => q.set_id === deletingQuizId)?._count.questions} preguntas
                  </p>
                </div>
              )}
              <p className="mt-3 text-red-400 font-semibold">
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDelete}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-gaming"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Quiz
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

