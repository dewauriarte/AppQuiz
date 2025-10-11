import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { QuestionEditor } from '@/components/ai/QuestionEditor';

const previewSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  subject_area: z.string().min(2, 'La materia es requerida'),
  grade_level: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(z.object({
    question_text: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres'),
    question_type: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    bloom_level: z.number().min(1).max(6),
    time_limit: z.number().min(10).max(300),
    points: z.number().min(1).max(10000),
    explanation: z.string().optional(),
    options: z.array(z.object({
      option_text: z.string().min(1, 'La opción no puede estar vacía'),
      is_correct: z.boolean(),
      explanation: z.string().optional(),
    })).min(2, 'Debe haber al menos 2 opciones').max(6, 'Máximo 6 opciones'),
  })).min(1, 'Debe haber al menos 1 pregunta'),
});

type PreviewFormData = z.infer<typeof previewSchema>;

export default function PreviewQuestionSetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number>(0);

  const previewData = location.state?.previewData;
  const aiMetadata = location.state?.aiMetadata;

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<PreviewFormData>({
    resolver: zodResolver(previewSchema),
    defaultValues: previewData || {
      title: '',
      description: '',
      subject_area: '',
      grade_level: '',
      difficulty: 'medium',
      questions: [],
    },
  });

  const { fields: questionFields } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    if (!previewData) {
      toast.error('No hay datos para previsualizar');
      navigate('/ai-generator');
    }
  }, [previewData, navigate]);

  const onSave = async (data: PreviewFormData) => {
    try {
      setIsSaving(true);

      // Validar que todas las preguntas tengan al menos una respuesta correcta
      for (let i = 0; i < data.questions.length; i++) {
        const correctOptions = data.questions[i].options.filter(opt => opt.is_correct);
        if (correctOptions.length === 0) {
          toast.error(`La pregunta ${i + 1} debe tener al menos una respuesta correcta`);
          setExpandedQuestion(i);
          return;
        }
      }

      const payload = {
        title: data.title,
        description: data.description,
        subject_area: data.subject_area,
        grade_level: data.grade_level,
        difficulty: data.difficulty,
        is_public: false,
        tags: ['ai-generated', aiMetadata?.provider || 'ai'],
        questions: data.questions,
      };

      const { data: response } = await api.post('/question-sets', payload);
      toast.success('¡Quiz guardado exitosamente!');
      navigate(`/question-sets/${response.data.set_id}`);
    } catch (error: any) {
      console.error('Error saving question set:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el quiz');
    } finally {
      setIsSaving(false);
    }
  };

  if (!previewData) {
    return null;
  }

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
            onClick={() => navigate('/ai-generator')}
            className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Generador
          </Button>

          <div className="game-card bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-6 border-2 border-amber-500 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center level-badge shadow-xl">
                <Edit2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-gaming text-white">
                  PREVIEW Y EDICIÓN
                </h1>
                <p className="text-amber-200">
                  Revisa y edita las preguntas antes de guardar el quiz
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          {/* Información básica */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardHeader className="border-b border-purple-500/30">
                <CardTitle className="text-white font-gaming">INFORMACIÓN BÁSICA</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-purple-200 font-gaming mb-2 block">
                    Título del Quiz *
                  </Label>
                  <Input
                    {...register('title')}
                    placeholder="Ej: Quiz de Biología - Fotosíntesis"
                    className="bg-slate-900 text-white border-purple-500/50 w-full"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1 break-words">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-purple-200 font-gaming mb-2 block">
                    Descripción
                  </Label>
                  <Input
                    {...register('description')}
                    placeholder="Descripción breve del quiz"
                    className="bg-slate-900 text-white border-purple-500/50 w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-purple-200 font-gaming mb-2 block">
                      Materia/Área *
                    </Label>
                    <Input
                      {...register('subject_area')}
                      placeholder="Ej: Biología"
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                    {errors.subject_area && (
                      <p className="text-red-400 text-sm mt-1">{errors.subject_area.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-purple-200 font-gaming mb-2 block">
                      Grado/Nivel
                    </Label>
                    <Input
                      {...register('grade_level')}
                      placeholder="Ej: 10mo"
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200 font-gaming mb-2 block">
                      Dificultad *
                    </Label>
                    <Select
                      value={watch('difficulty')}
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
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preguntas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-2 border-indigo-500/30">
              <CardHeader className="border-b border-indigo-500/30">
                <CardTitle className="text-white font-gaming">
                  PREGUNTAS ({questionFields.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <AnimatePresence>
                  {questionFields.map((field, qIndex) => (
                    <QuestionEditor
                      key={field.id}
                      questionIndex={qIndex}
                      register={register}
                      control={control}
                      setValue={setValue}
                      watch={watch}
                      errors={errors}
                      isExpanded={expandedQuestion === qIndex}
                      onToggleExpand={() => setExpandedQuestion(expandedQuestion === qIndex ? -1 : qIndex)}
                    />
                  ))}
                </AnimatePresence>

                {errors.questions && (
                  <p className="text-red-400 text-sm">{errors.questions.message}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/ai-generator')}
              className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 min-w-32"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Quiz
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
