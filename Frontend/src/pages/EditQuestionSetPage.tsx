import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save,
  Loader2,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const updateQuestionSetSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  description: z.string().optional(),
  subject_area: z.string().min(2, 'La materia es requerida'),
  grade_level: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  is_public: z.boolean(),
  tags: z.string().optional(),
});

type UpdateQuestionSetInput = z.infer<typeof updateQuestionSetSchema>;

interface QuestionSet {
  set_id: number;
  title: string;
  description: string | null;
  subject: string;
  grade_level: string | null;
  difficulty: string;
  is_public: boolean;
  tags: string[];
  total_questions: number;
  created_at: string;
  updated_at: string;
  questions: any[];
}

export default function EditQuestionSetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UpdateQuestionSetInput>({
    resolver: zodResolver(updateQuestionSetSchema),
    defaultValues: {
      difficulty: 'medium',
      is_public: false,
    },
  });

  useEffect(() => {
    const loadQuestionSet = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/question-sets/${id}`);
        const qs = data.data;
        setQuestionSet(qs);

        // Cargar datos en el formulario
        setValue('title', qs.title);
        setValue('description', qs.description || '');
        setValue('subject_area', qs.subject);
        setValue('grade_level', qs.grade_level || '');
        setValue('difficulty', qs.difficulty);
        setValue('is_public', qs.is_public);
        setValue('tags', Array.isArray(qs.tags) ? qs.tags.join(', ') : '');
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
  }, [id, navigate, setValue]);

  const onSubmit = async (data: UpdateQuestionSetInput) => {
    try {
      setIsSaving(true);

      // Procesar tags
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      await api.put(`/question-sets/${id}`, payload);
      toast.success('¡Quiz actualizado exitosamente!');
      navigate(`/question-sets/${id}`);
    } catch (error: any) {
      console.error('Error updating question set:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el quiz');
    } finally {
      setIsSaving(false);
    }
  };

  const difficulty = watch('difficulty');
  const isPublic = watch('is_public');

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

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'from-green-600 to-emerald-600';
      case 'medium':
        return 'from-yellow-600 to-orange-600';
      case 'hard':
        return 'from-red-600 to-rose-600';
      default:
        return 'from-gray-600 to-gray-700';
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
            onClick={() => navigate(`/question-sets/${id}`)} 
            className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className={`game-card bg-gradient-to-br ${getDifficultyColor(difficulty)} rounded-xl p-6 border-2 border-yellow-500 shadow-2xl`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center level-badge shadow-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-gaming text-white">
                  EDITAR QUIZ
                </h1>
                <p className="text-yellow-200">
                  Modifica la información básica del quiz
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerta Informativa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-blue-950/30 border-2 border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-200 font-gaming text-sm">
                NOTA: Esta página solo permite editar la información básica del quiz (título, descripción, dificultad, etc.).
              </p>
              <p className="text-blue-300 text-sm mt-1">
                Para modificar las preguntas existentes, deberás crear un nuevo quiz o duplicar este y editarlo.
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardHeader className="border-b border-purple-500/30">
                <CardTitle className="text-white font-gaming">INFORMACIÓN DEL QUIZ</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="title" className="text-purple-200 font-gaming mb-2 block">
                    Título del Quiz *
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Ej: Quiz de Matemáticas - Álgebra Básica"
                    className="bg-slate-900 text-white border-purple-500/50"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-purple-200 font-gaming mb-2 block">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe brevemente el contenido del quiz..."
                    rows={3}
                    className="bg-slate-900 text-white border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject_area" className="text-purple-200 font-gaming mb-2 block">
                      Materia/Área *
                    </Label>
                    <Input
                      id="subject_area"
                      {...register('subject_area')}
                      placeholder="Ej: Matemáticas, Biología, Historia"
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                    {errors.subject_area && (
                      <p className="text-red-400 text-sm mt-1">{errors.subject_area.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="grade_level" className="text-purple-200 font-gaming mb-2 block">
                      Grado/Nivel
                    </Label>
                    <Input
                      id="grade_level"
                      {...register('grade_level')}
                      placeholder="Ej: 10mo Grado, Universitario"
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-purple-200 font-gaming mb-2 block">
                      Dificultad *
                    </Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value) => setValue('difficulty', value as any)}
                    >
                      <SelectTrigger className="bg-slate-900 text-white border-purple-500/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-purple-500 text-white">
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-purple-200 font-gaming mb-2 block">
                      Etiquetas (separadas por comas)
                    </Label>
                    <Input
                      id="tags"
                      {...register('tags')}
                      placeholder="álgebra, ecuaciones, secundaria"
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    {...register('is_public')}
                    className="w-5 h-5 rounded border-purple-500 bg-slate-900"
                  />
                  <Label htmlFor="is_public" className="text-purple-200 font-gaming cursor-pointer">
                    Hacer público (otros profesores podrán ver y duplicar este quiz)
                  </Label>
                </div>

                {isPublic && (
                  <div className="bg-amber-950/30 border-2 border-amber-500/30 rounded-lg p-3">
                    <p className="text-amber-200 text-sm">
                      ⚠️ Este quiz será visible para todos los profesores de la plataforma.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Estadísticas del Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800 border-2 border-indigo-500/30">
              <CardHeader className="border-b border-indigo-500/30">
                <CardTitle className="text-white font-gaming">ESTADÍSTICAS ACTUALES</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-950/30 rounded-xl border-2 border-blue-500/30">
                    <p className="text-xs font-gaming text-blue-300 mb-1">PREGUNTAS</p>
                    <p className="text-3xl font-gaming text-blue-400">{questionSet.total_questions}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-950/30 rounded-xl border-2 border-purple-500/30">
                    <p className="text-xs font-gaming text-purple-300 mb-1">CREADO</p>
                    <p className="text-sm font-gaming text-purple-400">
                      {new Date(questionSet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-950/30 rounded-xl border-2 border-green-500/30">
                    <p className="text-xs font-gaming text-green-300 mb-1">ACTUALIZADO</p>
                    <p className="text-sm font-gaming text-green-400">
                      {new Date(questionSet.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-amber-950/30 rounded-xl border-2 border-amber-500/30">
                    <p className="text-xs font-gaming text-amber-300 mb-1">VISIBILIDAD</p>
                    <Badge className={questionSet.is_public ? 'bg-green-600' : 'bg-gray-600'}>
                      {questionSet.is_public ? 'Público' : 'Privado'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/question-sets/${id}`)}
              className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-orange-600 hover:to-yellow-600 min-w-32"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

