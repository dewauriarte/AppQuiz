import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Play,
  BarChart3,
  Loader2,
  BookOpen,
  Clock,
  Award,
  Target,
  Edit2
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { QuestionEditModal } from '@/components/ai/QuestionEditModal';

interface Question {
  question_id: number;
  question_text: string;
  question_type: string;
  difficulty: number;
  bloom_taxonomy_level: string;
  time_limit: number;
  points: number;
  explanation: string | null;
  order_index: number;
  question_options: QuestionOption[];
}

interface QuestionOption {
  option_id: number;
  option_text: string;
  is_correct: boolean;
  explanation: string | null;
  position: number;
}

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
  updated_at: string;
  questions: Question[];
  users: {
    user_id: number;
    username: string;
    display_name: string | null;
  };
}

export default function QuestionSetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadQuestionSet = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/question-sets/${id}`);
        setQuestionSet(data.data);
      } catch (error: any) {
        console.error('Error loading question set:', error);
        toast.error('Error al cargar el quiz');
        navigate('/question-sets');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadQuestionSet();
    }
  }, [id, navigate]);

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleEditQuestion = (question: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingQuestion(null);
  };

  const handleEditSuccess = async () => {
    // Recargar el question set
    if (id) {
      try {
        const { data } = await api.get(`/question-sets/${id}`);
        setQuestionSet(data.data);
        toast.success('Vista actualizada');
      } catch (error) {
        console.error('Error reloading question set:', error);
      }
    }
  };

  const getDifficultyText = (num: number) => {
    if (num <= 3) return { text: 'Fácil', color: 'bg-green-600' };
    if (num <= 6) return { text: 'Medio', color: 'bg-yellow-600' };
    return { text: 'Difícil', color: 'bg-red-600' };
  };

  const getDifficultySetColor = (diff: string) => {
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

  const getDifficultySetText = (diff: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!questionSet) {
    return null;
  }

  const avgTimeLimit =
    questionSet.questions.reduce((sum, q) => sum + q.time_limit, 0) /
      questionSet.questions.length || 0;

  const avgPoints =
    questionSet.questions.reduce((sum, q) => sum + q.points, 0) /
      questionSet.questions.length || 0;

  const totalTime = questionSet.questions.reduce((sum, q) => sum + q.time_limit, 0);

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
            onClick={() => navigate('/question-sets')} 
            className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="game-card bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 border-2 border-indigo-500 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center level-badge shadow-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-gaming text-white mb-2">
                    {questionSet.title}
                  </h1>
                  <p className="text-indigo-200">
                    {questionSet.description || 'Sin descripción'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getDifficultySetColor(questionSet.difficulty)}>
                      {getDifficultySetText(questionSet.difficulty)}
                    </Badge>
                    <Badge className="bg-blue-600">
                      {questionSet.questions.length} preguntas
                    </Badge>
                    <Badge className="bg-purple-600">
                      📚 {questionSet.subject}
                    </Badge>
                    {questionSet.grade_level && (
                      <Badge className="bg-indigo-600">
                        🎓 {questionSet.grade_level}
                      </Badge>
                    )}
                    {questionSet.is_public && (
                      <Badge className="bg-green-600">Público</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate(`/question-sets/${id}/edit`)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-orange-600 hover:to-yellow-600"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => toast('Iniciar juego próximamente', { icon: '🎮' })}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Jugar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-800 border-2 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white font-gaming flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                ESTADÍSTICAS DEL QUIZ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-950/30 rounded-xl border-2 border-blue-500/30">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                  <p className="text-xs font-gaming text-blue-300 mb-1">PREGUNTAS</p>
                  <p className="text-3xl font-gaming text-blue-400">{questionSet.questions.length}</p>
                </div>
                <div className="text-center p-4 bg-green-950/30 rounded-xl border-2 border-green-500/30">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  <p className="text-xs font-gaming text-green-300 mb-1">TIEMPO TOTAL</p>
                  <p className="text-3xl font-gaming text-green-400">{totalTime}s</p>
                </div>
                <div className="text-center p-4 bg-purple-950/30 rounded-xl border-2 border-purple-500/30">
                  <Target className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                  <p className="text-xs font-gaming text-purple-300 mb-1">TIEMPO PROM.</p>
                  <p className="text-3xl font-gaming text-purple-400">{Math.round(avgTimeLimit)}s</p>
                </div>
                <div className="text-center p-4 bg-amber-950/30 rounded-xl border-2 border-amber-500/30">
                  <Award className="w-10 h-10 mx-auto mb-3 text-amber-400" />
                  <p className="text-xs font-gaming text-amber-300 mb-1">PUNTOS PROM.</p>
                  <p className="text-3xl font-gaming text-amber-400">{Math.round(avgPoints)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800 border-2 border-indigo-500/30">
            <CardHeader>
              <CardTitle className="text-white font-gaming">PREGUNTAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionSet.questions.map((question, index) => {
                const isExpanded = expandedQuestions.has(question.question_id);
                const difficultyInfo = getDifficultyText(question.difficulty);

                return (
                  <div
                    key={question.question_id}
                    className="bg-slate-900/50 rounded-lg border-2 border-purple-500/20 p-4"
                  >
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => toggleQuestion(question.question_id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-gaming text-white flex-shrink-0">
                            {index + 1}
                          </div>
                          <h3 className="text-white font-medium break-words flex-1 min-w-0">
                            {question.question_text}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-11">
                          <Badge className={difficultyInfo.color}>
                            {difficultyInfo.text}
                          </Badge>
                          <Badge className="bg-blue-600">
                            ⏱️ {question.time_limit}s
                          </Badge>
                          <Badge className="bg-amber-600">
                            🏆 {question.points} pts
                          </Badge>
                          <Badge className="bg-indigo-600">
                            {question.bloom_taxonomy_level}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleEditQuestion(question, e)}
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                          title="Editar pregunta"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-400"
                        >
                          {isExpanded ? '▲' : '▼'}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 ml-11 space-y-2"
                      >
                        <h4 className="text-sm font-gaming text-purple-300 mb-2">OPCIONES:</h4>
                        {question.question_options
                          .sort((a, b) => a.position - b.position)
                          .map((option) => (
                            <div
                              key={option.option_id}
                              className={`p-3 rounded-lg border-2 ${
                                option.is_correct
                                  ? 'border-green-500 bg-green-950/20'
                                  : 'border-slate-600 bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-white font-medium">
                                  {String.fromCharCode(65 + option.position)}.
                                </span>
                                <div className="flex-1">
                                  <p className="text-white">{option.option_text}</p>
                                  {option.explanation && (
                                    <p className="text-sm text-gray-400 mt-1">
                                      💡 {option.explanation}
                                    </p>
                                  )}
                                </div>
                                {option.is_correct && (
                                  <Badge className="bg-green-600">✓ Correcta</Badge>
                                )}
                              </div>
                            </div>
                          ))}

                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-950/20 border-2 border-blue-500/30 rounded-lg">
                            <p className="text-sm font-gaming text-blue-300 mb-1">
                              EXPLICACIÓN:
                            </p>
                            <p className="text-white text-sm">{question.explanation}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal de edición */}
      {editingQuestion && (
        <QuestionEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          question={editingQuestion}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

