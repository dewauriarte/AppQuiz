import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  BookOpen
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const questionSchema = z.object({
  question_text: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres'),
  question_type: z.enum(['multiple_choice']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  bloom_level: z.number().min(1).max(6),
  time_limit: z.number().min(10).max(300),
  points: z.number().min(1).max(1000),
  explanation: z.string().optional(),
  options: z.array(
    z.object({
      option_text: z.string().min(1, 'La opción no puede estar vacía'),
      is_correct: z.boolean(),
      explanation: z.string().optional(),
    })
  ).min(2, 'Debe haber al menos 2 opciones').max(6, 'Máximo 6 opciones'),
});

const createQuestionSetSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  description: z.string().optional(),
  subject_area: z.string().min(2, 'La materia es requerida'),
  grade_level: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  is_public: z.boolean(),
  tags: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'Debe haber al menos 1 pregunta'),
});

type CreateQuestionSetInput = z.infer<typeof createQuestionSetSchema>;

export default function CreateQuestionSetPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number>(0);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateQuestionSetInput>({
    resolver: zodResolver(createQuestionSetSchema),
    defaultValues: {
      difficulty: 'medium',
      is_public: false,
      questions: [
        {
          question_text: '',
          question_type: 'multiple_choice',
          difficulty: 'medium',
          bloom_level: 2,
          time_limit: 30,
          points: 100,
          explanation: '',
          options: [
            { option_text: '', is_correct: true, explanation: '' },
            { option_text: '', is_correct: false, explanation: '' },
            { option_text: '', is_correct: false, explanation: '' },
            { option_text: '', is_correct: false, explanation: '' },
          ],
        },
      ],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = async (data: CreateQuestionSetInput) => {
    try {
      setIsSaving(true);

      // Validar que al menos una opción sea correcta en cada pregunta
      for (let i = 0; i < data.questions.length; i++) {
        const correctOptions = data.questions[i].options.filter(opt => opt.is_correct);
        if (correctOptions.length === 0) {
          toast.error(`La pregunta ${i + 1} debe tener al menos una respuesta correcta`);
          setExpandedQuestion(i);
          return;
        }
      }

      // Procesar tags
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      const { data: response } = await api.post('/question-sets', payload);
      toast.success('¡Quiz creado exitosamente!');
      navigate(`/question-sets/${response.data.set_id}`);
    } catch (error: any) {
      console.error('Error creating question set:', error);
      toast.error(error.response?.data?.message || 'Error al crear el quiz');
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    appendQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      difficulty: 'medium',
      bloom_level: 2,
      time_limit: 30,
      points: 100,
      explanation: '',
      options: [
        { option_text: '', is_correct: true, explanation: '' },
        { option_text: '', is_correct: false, explanation: '' },
        { option_text: '', is_correct: false, explanation: '' },
        { option_text: '', is_correct: false, explanation: '' },
      ],
    });
    setExpandedQuestion(questionFields.length);
  };

  const difficulty = watch('difficulty');

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
          
          <div className="game-card bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-6 border-2 border-green-500 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center level-badge shadow-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-gaming text-white">
                  CREAR NUEVO QUIZ
                </h1>
                <p className="text-green-200">
                  Forja un nuevo desafío educativo para tus estudiantes
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-gaming">
                    PREGUNTAS ({questionFields.length})
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Pregunta
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <AnimatePresence>
                  {questionFields.map((field, qIndex) => {
                    const isExpanded = expandedQuestion === qIndex;
                    const questionWatch = watch(`questions.${qIndex}`);

                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-slate-900/50 rounded-lg border-2 border-indigo-500/20 p-4"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedQuestion(isExpanded ? -1 : qIndex)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-gaming text-white">
                              {qIndex + 1}
                            </div>
                            <div>
                              <h3 className="text-white font-medium">
                                {questionWatch?.question_text || 'Nueva pregunta'}
                              </h3>
                              {questionWatch?.question_text && (
                                <div className="flex gap-2 mt-1">
                                  <Badge className="bg-blue-600 text-xs">
                                    {questionWatch.difficulty}
                                  </Badge>
                                  <Badge className="bg-amber-600 text-xs">
                                    {questionWatch.points} pts
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {questionFields.length > 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeQuestion(qIndex);
                                }}
                                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-purple-400"
                            >
                              {isExpanded ? '▲' : '▼'}
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <QuestionForm
                            questionIndex={qIndex}
                            register={register}
                            control={control}
                            setValue={setValue}
                            watch={watch}
                            errors={errors}
                          />
                        )}
                      </motion.div>
                    );
                  })}
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
              onClick={() => navigate('/question-sets')}
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
                  Crear Quiz
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

// Componente para formulario de pregunta individual
function QuestionForm({ questionIndex, register, control, setValue, watch, errors }: any) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const questionDifficulty = watch(`questions.${questionIndex}.difficulty`);

  return (
    <div className="mt-4 space-y-4 pl-11">
      <div>
        <Label className="text-purple-200 font-gaming mb-2 block">
          Texto de la Pregunta *
        </Label>
        <Textarea
          {...register(`questions.${questionIndex}.question_text`)}
          placeholder="Escribe aquí tu pregunta..."
          rows={3}
          className="bg-slate-800 text-white border-purple-500/50"
        />
        {errors.questions?.[questionIndex]?.question_text && (
          <p className="text-red-400 text-sm mt-1">
            {errors.questions[questionIndex].question_text.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label className="text-purple-200 font-gaming mb-2 block text-xs">
            Dificultad
          </Label>
          <Select
            value={questionDifficulty}
            onValueChange={(value) => setValue(`questions.${questionIndex}.difficulty`, value)}
          >
            <SelectTrigger className="bg-slate-800 text-white border-purple-500/50 text-sm">
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
          <Label className="text-purple-200 font-gaming mb-2 block text-xs">
            Nivel Bloom (1-6)
          </Label>
          <Input
            type="number"
            min={1}
            max={6}
            {...register(`questions.${questionIndex}.bloom_level`, { valueAsNumber: true })}
            className="bg-slate-800 text-white border-purple-500/50 text-sm"
          />
        </div>

        <div>
          <Label className="text-purple-200 font-gaming mb-2 block text-xs">
            Tiempo (seg)
          </Label>
          <Input
            type="number"
            min={10}
            max={300}
            {...register(`questions.${questionIndex}.time_limit`, { valueAsNumber: true })}
            className="bg-slate-800 text-white border-purple-500/50 text-sm"
          />
        </div>

        <div>
          <Label className="text-purple-200 font-gaming mb-2 block text-xs">
            Puntos
          </Label>
          <Input
            type="number"
            min={1}
            max={1000}
            {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
            className="bg-slate-800 text-white border-purple-500/50 text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-purple-200 font-gaming mb-2 block">
          Explicación (opcional)
        </Label>
        <Textarea
          {...register(`questions.${questionIndex}.explanation`)}
          placeholder="Explica por qué esta es la respuesta correcta..."
          rows={2}
          className="bg-slate-800 text-white border-purple-500/50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-purple-200 font-gaming">
            Opciones de Respuesta ({optionFields.length})
          </Label>
          {optionFields.length < 6 && (
            <Button
              type="button"
              size="sm"
              onClick={() => appendOption({ option_text: '', is_correct: false, explanation: '' })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-1 h-3 w-3" />
              Agregar Opción
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {optionFields.map((option, oIndex) => {
            const isCorrect = watch(`questions.${questionIndex}.options.${oIndex}.is_correct`);

            return (
              <div
                key={option.id}
                className={`p-3 rounded-lg border-2 ${
                  isCorrect ? 'border-green-500 bg-green-950/20' : 'border-slate-600 bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-white font-medium mt-2">
                    {String.fromCharCode(65 + oIndex)}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        {...register(`questions.${questionIndex}.options.${oIndex}.option_text`)}
                        placeholder="Texto de la opción"
                        className="bg-slate-900 text-white border-purple-500/50"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(`questions.${questionIndex}.options.${oIndex}.is_correct`)}
                          className="w-5 h-5 rounded border-green-500 bg-slate-900"
                        />
                        <Label className="text-xs text-green-400 whitespace-nowrap">
                          Correcta
                        </Label>
                      </div>
                      {optionFields.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeOption(oIndex)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      {...register(`questions.${questionIndex}.options.${oIndex}.explanation`)}
                      placeholder="Explicación de esta opción (opcional)"
                      className="bg-slate-900 text-white border-purple-500/50 text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {errors.questions?.[questionIndex]?.options && (
          <p className="text-red-400 text-sm mt-2">
            {errors.questions[questionIndex].options.message}
          </p>
        )}
      </div>
    </div>
  );
}

