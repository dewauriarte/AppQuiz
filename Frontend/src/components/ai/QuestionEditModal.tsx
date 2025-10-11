import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const questionEditSchema = z.object({
  question_text: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres'),
  difficulty: z.number().min(1).max(10),
  bloom_taxonomy_level: z.string(),
  time_limit: z.number().min(10).max(300),
  points: z.number().min(1).max(10000),
  explanation: z.string().optional(),
  options: z.array(z.object({
    option_id: z.number().optional(),
    option_text: z.string().min(1, 'La opción no puede estar vacía'),
    is_correct: z.boolean(),
    explanation: z.string().optional(),
  })).min(2, 'Debe haber al menos 2 opciones').max(6, 'Máximo 6 opciones'),
});

type QuestionEditFormData = z.infer<typeof questionEditSchema>;

interface QuestionOption {
  option_id: number;
  option_text: string;
  is_correct: boolean;
  explanation: string | null;
  position: number;
}

interface Question {
  question_id: number;
  question_text: string;
  question_type: string;
  difficulty: number;
  bloom_taxonomy_level: string;
  time_limit: number;
  points: number;
  explanation: string | null;
  question_options: QuestionOption[];
}

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onSuccess: () => void;
}

export function QuestionEditModal({ isOpen, onClose, question, onSuccess }: QuestionEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<QuestionEditFormData>({
    resolver: zodResolver(questionEditSchema),
    defaultValues: {
      question_text: '',
      difficulty: 5,
      bloom_taxonomy_level: 'Recordar',
      time_limit: 30,
      points: 100,
      explanation: '',
      options: [],
    },
  });

  const { fields: optionFields } = useFieldArray({
    control,
    name: 'options',
  });

  useEffect(() => {
    if (question && isOpen) {
      reset({
        question_text: question.question_text,
        difficulty: question.difficulty,
        bloom_taxonomy_level: question.bloom_taxonomy_level,
        time_limit: question.time_limit,
        points: question.points,
        explanation: question.explanation || '',
        options: question.question_options
          .sort((a, b) => a.position - b.position)
          .map(opt => ({
            option_id: opt.option_id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            explanation: opt.explanation || '',
          })),
      });
    }
  }, [question, isOpen, reset]);

  const onSave = async (data: QuestionEditFormData) => {
    try {
      setIsSaving(true);

      // Validar que haya al menos una respuesta correcta
      const correctOptions = data.options.filter(opt => opt.is_correct);
      if (correctOptions.length === 0) {
        toast.error('Debe haber al menos una respuesta correcta');
        return;
      }

      const payload = {
        question_text: data.question_text,
        difficulty: data.difficulty,
        bloom_taxonomy_level: data.bloom_taxonomy_level,
        time_limit: data.time_limit,
        points: data.points,
        explanation: data.explanation || null,
        options: data.options.map((opt, index) => ({
          option_id: opt.option_id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          explanation: opt.explanation || null,
          position: index,
        })),
      };

      await api.put(`/questions/${question.question_id}`, payload);
      toast.success('¡Pregunta actualizada exitosamente!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la pregunta');
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyText = (num: number) => {
    if (num <= 3) return 'Fácil';
    if (num <= 6) return 'Medio';
    return 'Difícil';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-2 border-purple-500/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-gaming text-2xl text-purple-400">
            EDITAR PREGUNTA
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Modifica la pregunta y sus opciones de respuesta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-6 py-4">
          {/* Texto de la pregunta */}
          <div>
            <Label className="text-purple-200 font-gaming mb-2 block">
              Texto de la Pregunta
            </Label>
            <Textarea
              {...register('question_text')}
              placeholder="Escribe aquí tu pregunta..."
              rows={3}
              className="bg-slate-800 text-white border-purple-500/50"
            />
            {errors.question_text && (
              <p className="text-red-400 text-sm mt-1">{errors.question_text.message}</p>
            )}
          </div>

          {/* Configuración de pregunta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-purple-200 font-gaming mb-2 block text-xs">
                Dificultad (1-10)
              </Label>
              <Input
                type="number"
                min={1}
                max={10}
                {...register('difficulty', { valueAsNumber: true })}
                className="bg-slate-800 text-white border-purple-500/50 text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                {getDifficultyText(watch('difficulty'))}
              </p>
            </div>

            <div>
              <Label className="text-purple-200 font-gaming mb-2 block text-xs">
                Taxonomía Bloom
              </Label>
              <Input
                {...register('bloom_taxonomy_level')}
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
                {...register('time_limit', { valueAsNumber: true })}
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
                max={10000}
                {...register('points', { valueAsNumber: true })}
                className="bg-slate-800 text-white border-purple-500/50 text-sm"
              />
            </div>
          </div>

          {/* Explicación */}
          <div>
            <Label className="text-purple-200 font-gaming mb-2 block text-xs">
              Explicación (Opcional)
            </Label>
            <Textarea
              {...register('explanation')}
              placeholder="Explicación adicional sobre la pregunta..."
              rows={2}
              className="bg-slate-800 text-white border-purple-500/50 text-sm"
            />
          </div>

          {/* Opciones de respuesta */}
          <div>
            <Label className="text-purple-200 font-gaming mb-2 block">
              Opciones de Respuesta ({optionFields.length})
            </Label>

            <div className="space-y-3">
              {optionFields.map((option, oIndex) => {
                const isCorrect = watch(`options.${oIndex}.is_correct`);

                return (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg border-2 ${
                      isCorrect ? 'border-green-500 bg-green-950/20' : 'border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-white font-medium mt-2 flex-shrink-0">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-col md:flex-row gap-2">
                          <Input
                            {...register(`options.${oIndex}.option_text`)}
                            placeholder="Texto de la opción"
                            className="bg-slate-900 text-white border-purple-500/50 flex-1"
                          />
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input
                              type="checkbox"
                              {...register(`options.${oIndex}.is_correct`)}
                              className="w-5 h-5 rounded border-green-500 bg-slate-900"
                            />
                            <Label className="text-xs text-green-400 whitespace-nowrap">
                              Correcta
                            </Label>
                          </div>
                        </div>
                        <Input
                          {...register(`options.${oIndex}.explanation`)}
                          placeholder="Explicación de esta opción (opcional)"
                          className="bg-slate-900 text-white border-purple-500/50 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.options && (
              <p className="text-red-400 text-sm mt-2">
                {errors.options.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
