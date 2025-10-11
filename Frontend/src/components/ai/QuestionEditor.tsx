import { useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QuestionEditorProps {
  questionIndex: number;
  register: any;
  control: any;
  setValue: any;
  watch: any;
  errors: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function QuestionEditor({
  questionIndex,
  register,
  control,
  setValue,
  watch,
  errors,
  isExpanded,
  onToggleExpand,
}: QuestionEditorProps) {
  const { fields: optionFields } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const questionWatch = watch(`questions.${questionIndex}`);
  const questionDifficulty = watch(`questions.${questionIndex}.difficulty`);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-slate-800/50 rounded-lg border-2 border-indigo-500/20 p-4"
    >
      {/* Header colapsable */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-gaming text-white text-sm flex-shrink-0">
            {questionIndex + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium line-clamp-2 break-words">
              {questionWatch?.question_text || 'Nueva pregunta'}
            </h3>
            {questionWatch?.question_text && (
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge className="bg-blue-600 text-xs">
                  {questionWatch.difficulty}
                </Badge>
                <Badge className="bg-amber-600 text-xs">
                  {questionWatch.points} pts
                </Badge>
                <Badge className="bg-purple-600 text-xs">
                  {questionWatch.time_limit}s
                </Badge>
              </div>
            )}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-purple-400 flex-shrink-0"
        >
          {isExpanded ? '▲' : '▼'}
        </Button>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="mt-4 space-y-4 pl-0 md:pl-11">
          {/* Texto de pregunta */}
          <div>
            <Label className="text-purple-200 font-gaming mb-2 block text-sm">
              Texto de la Pregunta
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

          {/* Configuración de pregunta */}
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
                Nivel Bloom
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
                max={10000}
                {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
                className="bg-slate-800 text-white border-purple-500/50 text-sm"
              />
            </div>
          </div>

          {/* Opciones de respuesta */}
          <div>
            <Label className="text-purple-200 font-gaming mb-2 block text-sm">
              Opciones de Respuesta ({optionFields.length})
            </Label>

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
                      <span className="text-white font-medium mt-2 flex-shrink-0">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-col md:flex-row gap-2">
                          <Input
                            {...register(`questions.${questionIndex}.options.${oIndex}.option_text`)}
                            placeholder="Texto de la opción"
                            className="bg-slate-900 text-white border-purple-500/50 flex-1"
                          />
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input
                              type="checkbox"
                              {...register(`questions.${questionIndex}.options.${oIndex}.is_correct`)}
                              className="w-5 h-5 rounded border-green-500 bg-slate-900"
                            />
                            <Label className="text-xs text-green-400 whitespace-nowrap">
                              Correcta
                            </Label>
                          </div>
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
      )}
    </motion.div>
  );
}
