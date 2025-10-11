import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, FileText, Zap, Save, Eye, ArrowLeft, Loader2, RefreshCcw, Settings, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { PDFUploadZone } from '@/components/ai/PDFUploadZone';

const generateSchema = z.object({
  title: z.string().min(3, 'Título muy corto').max(200),
  text: z.string().min(100, 'Texto muy corto (mín. 100 caracteres)').optional(),
  subjectArea: z.string().min(2, 'Área requerida'),
  gradeLevel: z.string().optional(),
  numQuestions: z.number().min(1).max(50),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  provider: z.enum(['claude', 'gemini', 'openai']).optional(),
  language: z.string().default('español'),
  bloomLevel: z.number().min(1).max(6).default(3),
  includeExplanations: z.boolean().default(true),
  timePerQuestion: z.number().min(10).max(300).default(30),
});

type GenerateInput = z.infer<typeof generateSchema>;

interface AIProviderOption {
  name: 'claude' | 'gemini' | 'openai';
  displayName: string;
  available: boolean;
  costPerQuestion: number;
  currency?: string;
}

export default function AIQuizGenerator() {
  const navigate = useNavigate();
  const [generatedQuestions, setGeneratedQuestions] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [providers, setProviders] = useState<AIProviderOption[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false);
  const [hasLastGeneratedQuiz, setHasLastGeneratedQuiz] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    claude: localStorage.getItem('ANTHROPIC_API_KEY') || '',
    gemini: localStorage.getItem('GOOGLE_AI_API_KEY') || '',
    openai: localStorage.getItem('OPENAI_API_KEY') || '',
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GenerateInput>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      numQuestions: 10,
      difficulty: 'medium',
      language: 'español',
      bloomLevel: 3,
      includeExplanations: true,
      timePerQuestion: 30,
    },
  });

  const difficulty = watch('difficulty');
  const numQuestions = watch('numQuestions');
  const safeNumQuestions = useMemo(() => Math.max(numQuestions ?? 1, 1), [numQuestions]);
  const providerValue = watch('provider');

  const fieldLabelClass = useMemo(
    () => 'inline-flex w-fit items-center gap-2 rounded-md border border-amber-500/40 bg-slate-900/70 px-3 py-1 font-gaming text-xs uppercase tracking-widest text-amber-200 shadow-md md:text-sm',
    []
  );

  const fieldControlClass = useMemo(
    () => 'bg-slate-900 text-white border border-purple-500/50 placeholder:text-slate-400 focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-0 shadow-inner',
    []
  );

  const selectContentClass = useMemo(
    () => 'bg-slate-900 border border-amber-400/40 text-white shadow-2xl data-[state=open]:animate-none data-[state=closed]:animate-none translate-y-0 motion-reduce:transition-none',
    []
  );

  const selectItemClass = useMemo(
    () => 'font-gaming text-sm data-[state=checked]:bg-purple-600/70 data-[state=checked]:text-white focus:bg-purple-600/50 focus:text-white hover:bg-purple-600/30',
    []
  );

  // Cargar providers disponibles
  const loadProviders = useCallback(async () => {
    setIsLoadingProviders(true);
    setProvidersError(null);

    try {
      const { data } = await api.get<{ success: boolean; data: AIProviderOption[] }>('/ai/providers');

      if (data.success && Array.isArray(data.data)) {
         setProviders(data.data);
         setProvidersError(null);
      } else {
         setProviders([]);
         setProvidersError('No se encontraron proveedores configurados. Usa la opción automática.');
      }
    } catch (error: any) {
       setProviders([]);
       setProvidersError('No pudimos conectar con los proveedores de IA. Intenta nuevamente o continúa con la opción automática.');
       toast.error('Error al cargar proveedores de IA');
    } finally {
      setIsLoadingProviders(false);
    }
  }, []);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    // Verificar si hay un quiz guardado en sessionStorage
    const lastQuiz = sessionStorage.getItem('lastGeneratedQuiz');
    setHasLastGeneratedQuiz(!!lastQuiz);
  }, []);

  // Simulador de progreso para mejor UX
  const simulateProgress = useCallback((stage: 'upload' | 'parsing' | 'generating') => {
    const stages = {
      upload: { start: 0, end: 20, message: 'Subiendo archivo...' },
      parsing: { start: 20, end: 40, message: 'Analizando contenido...' },
      generating: { start: 40, end: 95, message: 'Generando preguntas con IA...' },
    };

    const { end, message } = stages[stage];
    setProgressMessage(message);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= end) {
          clearInterval(interval);
          return end;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const onGenerateFromText = async (data: GenerateInput) => {
    if (!data.text || data.text.length < 100) {
      toast.error('El texto debe tener al menos 100 caracteres');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProgressMessage('Iniciando generación...');

    const stopProgress = simulateProgress('generating');

    try {
      const response = await api.post('/ai-question-sets/generate-from-text', {
        title: data.title,
        text: data.text,
        subjectArea: data.subjectArea,
        gradeLevel: data.gradeLevel,
        numQuestions: data.numQuestions,
        difficulty: data.difficulty,
        provider: data.provider,
        language: data.language,
        bloomLevel: data.bloomLevel,
        includeExplanations: data.includeExplanations,
        timePerQuestion: data.timePerQuestion,
      });

      stopProgress();
      setProgress(100);
      setProgressMessage('¡Completado!');

      setGeneratedQuestions(response.data.data);
      toast.success('¡Quiz generado y guardado exitosamente!');
    } catch (error: any) {
      stopProgress();
      toast.error(error.response?.data?.message || 'Error al generar quiz');
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 2000);
    }
  };

  const onGenerateFromPDF = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Selecciona un archivo PDF');
      return;
    }

    // Obtener valores del formulario
    const title = watch('title');
    const subjectArea = watch('subjectArea');
    const gradeLevel = watch('gradeLevel');
    const numQuestions = watch('numQuestions') || 10;
    const difficulty = watch('difficulty') || 'medium';
    const provider = watch('provider');
    const language = watch('language') || 'español';
    const bloomLevel = watch('bloomLevel') || 3;
    const includeExplanations = watch('includeExplanations') ?? true;
    const timePerQuestion = watch('timePerQuestion') || 30;

    // Validaciones mínimas
    if (!title || title.length < 3) {
      toast.error('El título debe tener al menos 3 caracteres');
      return;
    }
    if (!subjectArea || subjectArea.length < 2) {
      toast.error('El área/materia es requerida');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simular upload
    let stopProgress = simulateProgress('upload');

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('title', title);
    formData.append('subjectArea', subjectArea);
    if (gradeLevel) formData.append('gradeLevel', gradeLevel);
    formData.append('numQuestions', numQuestions.toString());
    formData.append('difficulty', difficulty);
    if (provider) formData.append('provider', provider);
    formData.append('language', language);
    formData.append('bloomLevel', bloomLevel.toString());
    formData.append('includeExplanations', includeExplanations.toString());
    formData.append('timePerQuestion', timePerQuestion.toString());

    try {
      // Cambiar a parsing después de 2 segundos
      setTimeout(() => {
        stopProgress();
        stopProgress = simulateProgress('parsing');
      }, 2000);

      // Cambiar a generating después de 4 segundos
      setTimeout(() => {
        stopProgress();
        stopProgress = simulateProgress('generating');
      }, 4000);

      const response = await api.post('/ai-question-sets/generate-from-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      stopProgress();
      setProgress(100);
      setProgressMessage('¡Completado!');

      // Navegar a página de preview con los datos
      const result = response.data.data;

      // Transformar las preguntas para que coincidan con el schema del preview
      const transformedQuestions = (result.questionSet?.questions || []).map((q: any) => ({
        question_text: q.question_text,
        question_type: q.question_type || 'multiple_choice',
        difficulty: q.difficulty === 1 || q.difficulty === 2 || q.difficulty === 3 ? 'easy'
                   : q.difficulty === 4 || q.difficulty === 5 || q.difficulty === 6 ? 'medium'
                   : 'hard',
        bloom_level: q.bloom_level || 3,
        time_limit: q.time_limit || 30,
        points: q.points || 100,
        explanation: q.explanation || '',
        options: (q.question_options || []).map((opt: any) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          explanation: opt.explanation || '',
        })),
      }));

      const previewState = {
        previewData: {
          title,
          description: `Generated from PDF: ${selectedFile.name}`,
          subject_area: subjectArea,
          grade_level: gradeLevel || '',
          difficulty,
          questions: transformedQuestions,
        },
        aiMetadata: result.aiMetadata,
      };

      // Guardar en sessionStorage para poder volver
      sessionStorage.setItem('lastGeneratedQuiz', JSON.stringify(previewState));

      navigate('/ai-generator/preview', {
        state: previewState,
      });

      setSelectedFile(null);
    } catch (error: any) {
      stopProgress();
      toast.error(error.response?.data?.message || 'Error al generar desde PDF');
      console.error('Error generating from PDF:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 2000);
    }
  };

  const viewQuizDetails = () => {
    if (generatedQuestions?.questionSet) {
      navigate(`/question-sets/${generatedQuestions.questionSet.set_id}`);
    }
  };

  const handleSaveApiKeys = () => {
    // Guardar en localStorage
    if (apiKeys.claude) localStorage.setItem('ANTHROPIC_API_KEY', apiKeys.claude);
    else localStorage.removeItem('ANTHROPIC_API_KEY');

    if (apiKeys.gemini) localStorage.setItem('GOOGLE_AI_API_KEY', apiKeys.gemini);
    else localStorage.removeItem('GOOGLE_AI_API_KEY');

    if (apiKeys.openai) localStorage.setItem('OPENAI_API_KEY', apiKeys.openai);
    else localStorage.removeItem('OPENAI_API_KEY');

    setIsApiKeysDialogOpen(false);
    toast.success('Claves API guardadas localmente');

    // Recargar providers
    void loadProviders();
  };

  const goToLastPreview = () => {
    const lastQuiz = sessionStorage.getItem('lastGeneratedQuiz');
    if (lastQuiz) {
      try {
        const previewState = JSON.parse(lastQuiz);
        navigate('/ai-generator/preview', { state: previewState });
      } catch (error) {
        console.error('Error parsing last quiz:', error);
        toast.error('Error al cargar el último quiz');
      }
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

          <div className="game-card bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 border-2 border-purple-500 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center level-badge shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-gaming text-white">
                    GENERADOR IA
                  </h1>
                  <p className="text-purple-200">
                    Crea quizzes con inteligencia artificial
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-600 text-white text-lg px-4 py-2">
                <Zap className="mr-2 h-5 w-5" />
                AI
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-2 border-purple-500/30">
                <TabsTrigger value="text" className="flex items-center font-gaming data-[state=active]:bg-purple-600">
                  <FileText className="mr-2 h-4 w-4" />
                  TEXTO
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex items-center font-gaming data-[state=active]:bg-purple-600">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </TabsTrigger>
              </TabsList>

              {/* Texto */}
              <TabsContent value="text">
                <Card className="bg-slate-800 border-2 border-purple-500/30">
                  <CardHeader className="border-b border-purple-500/30">
                    <CardTitle className="text-white font-gaming">GENERAR DESDE TEXTO</CardTitle>
                    <CardDescription className="text-gray-400">Pega el contenido educativo y genera preguntas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onGenerateFromText)} className="space-y-4">
                      <div>
                        <Label htmlFor="title" className={fieldLabelClass}>Título del Quiz</Label>
                        <Input
                          id="title"
                          {...register('title')}
                          placeholder="Ej: Quiz de Biología - Fotosíntesis"
                          className={fieldControlClass}
                        />
                        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="text" className={fieldLabelClass}>Contenido Educativo</Label>
                        <Textarea
                          id="text"
                          {...register('text')}
                          placeholder="Pega aquí el contenido de tu clase, libro, apuntes, etc. (mínimo 100 caracteres)"
                          rows={8}
                          className={fieldControlClass}
                        />
                        {errors.text && <p className="text-red-400 text-sm mt-1">{errors.text.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subjectArea" className={fieldLabelClass}>Área/Materia</Label>
                          <Input
                            id="subjectArea"
                            {...register('subjectArea')}
                            placeholder="Ej: Biología"
                            className={fieldControlClass}
                          />
                          {errors.subjectArea && <p className="text-red-400 text-sm mt-1">{errors.subjectArea.message}</p>}
                        </div>

                        <div>
                          <Label htmlFor="gradeLevel" className={fieldLabelClass}>Grado/Nivel</Label>
                          <Input
                            id="gradeLevel"
                            {...register('gradeLevel')}
                            placeholder="Ej: 10mo"
                            className={fieldControlClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="numQuestions" className={fieldLabelClass}>Número de Preguntas</Label>
                          <Input
                            id="numQuestions"
                            type="number"
                            {...register('numQuestions', { valueAsNumber: true })}
                            min={1}
                            max={50}
                            className={fieldControlClass}
                          />
                        </div>

                        <div>
                          <Label htmlFor="difficulty" className={fieldLabelClass}>Dificultad</Label>
                          <Select
                            value={difficulty}
                            onValueChange={(value: string) => setValue('difficulty', value as GenerateInput['difficulty'])}
                          >
                            <SelectTrigger className={fieldControlClass}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={selectContentClass}>
                              <SelectItem value="easy" className={selectItemClass}>Fácil</SelectItem>
                              <SelectItem value="medium" className={selectItemClass}>Medio</SelectItem>
                              <SelectItem value="hard" className={selectItemClass}>Difícil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                        <div>
                          <Label htmlFor="provider" className={fieldLabelClass}>Provider de IA (Opcional)</Label>
                          <Select
                            value={providerValue ?? 'auto'}
                            onValueChange={(value: string) => {
                              const parsedValue = value === 'auto' ? undefined : (value as GenerateInput['provider']);
                              setValue('provider', parsedValue);
                            }}
                            disabled={isLoadingProviders}
                          >
                            <SelectTrigger className={`${fieldControlClass} data-[state=open]:border-amber-400`}
                              aria-label="Seleccionar provider de IA"
                            >
                              <SelectValue placeholder={isLoadingProviders ? "Cargando..." : "Automático (mejor disponible)"} />
                            </SelectTrigger>
                            <SelectContent className={selectContentClass}>
                              <SelectItem value="auto" className={selectItemClass}>
                                Automático (recomendado)
                              </SelectItem>
                              {providers.filter(p => p.name).map(p => (
                                <SelectItem
                                  key={p.name}
                                  value={p.name}
                                  className={selectItemClass}
                                  disabled={!p.available}
                                >
                                  {p.displayName} {p.available ? `($${(p.costPerQuestion * safeNumQuestions).toFixed(3)})` : '(No configurado)'}
                                </SelectItem>
                              ))}
                              {!isLoadingProviders && providers.length === 0 && (
                                <SelectItem value="sin-opciones" disabled className="text-xs text-purple-200/70">
                                  No hay providers configurados. Haz clic en "Config API"
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {providersError && (
                            <p className="mt-2 text-xs text-amber-200 flex items-center gap-1">
                              ⚠️ {providersError}
                            </p>
                          )}
                          {!isLoadingProviders && providers.length > 0 && (
                            <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                              ✓ {providers.filter(p => p.available).length} de {providers.length} provider{providers.length > 1 ? 's' : ''} disponible{providers.filter(p => p.available).length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generando con IA...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generar Quiz con IA
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PDF */}
              <TabsContent value="pdf">
                <Card className="bg-slate-800 border-2 border-purple-500/30">
                  <CardHeader className="border-b border-purple-500/30">
                    <CardTitle className="text-white font-gaming">GENERAR DESDE PDF</CardTitle>
                    <CardDescription className="text-gray-400">Sube un PDF y genera preguntas automáticamente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={onGenerateFromPDF} className="space-y-4">
                      <div>
                        <Label htmlFor="title-pdf" className={fieldLabelClass}>Título del Quiz</Label>
                        <Input
                          id="title-pdf"
                          {...register('title')}
                          placeholder="Ej: Quiz de Biología - Fotosíntesis"
                          className={fieldControlClass}
                        />
                        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                      </div>

                      {/* Componente PDF Upload con Drag & Drop */}
                      <div>
                        <Label className={fieldLabelClass}>Archivo PDF</Label>
                        <PDFUploadZone
                          selectedFile={selectedFile}
                          onFileSelect={setSelectedFile}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subjectArea-pdf" className={fieldLabelClass}>Área/Materia</Label>
                          <Input
                            id="subjectArea-pdf"
                            {...register('subjectArea')}
                            placeholder="Ej: Biología"
                            className={fieldControlClass}
                          />
                        </div>

                        <div>
                          <Label htmlFor="numQuestions-pdf" className={fieldLabelClass}>Preguntas</Label>
                          <Input
                            id="numQuestions-pdf"
                            type="number"
                            {...register('numQuestions', { valueAsNumber: true })}
                            min={1}
                            max={50}
                            className={fieldControlClass}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="provider-pdf" className={fieldLabelClass}>Provider de IA (Opcional)</Label>
                        <Select
                          value={providerValue ?? 'auto'}
                          onValueChange={(value: string) => {
                            const parsedValue = value === 'auto' ? undefined : (value as GenerateInput['provider']);
                            setValue('provider', parsedValue);
                          }}
                          disabled={isLoadingProviders}
                        >
                          <SelectTrigger className={`${fieldControlClass} data-[state=open]:border-amber-400`}
                            aria-label="Seleccionar provider de IA para PDF"
                          >
                            <SelectValue placeholder={isLoadingProviders ? "Cargando..." : "Automático (mejor disponible)"} />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            <SelectItem value="auto" className={selectItemClass}>
                              Automático (recomendado)
                            </SelectItem>
                            {providers.filter(p => p.name).map(p => (
                              <SelectItem
                                key={p.name}
                                value={p.name}
                                className={selectItemClass}
                                disabled={!p.available}
                              >
                                {p.displayName} {p.available ? `($${(p.costPerQuestion * safeNumQuestions).toFixed(3)})` : '(No configurado)'}
                              </SelectItem>
                            ))}
                            {!isLoadingProviders && providers.length === 0 && (
                              <SelectItem value="sin-opciones" disabled className="text-xs text-purple-200/70">
                                No hay providers configurados. Haz clic en "Config API"
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {providersError && (
                          <p className="mt-2 text-xs text-amber-200 flex items-center gap-1">
                            ⚠️ {providersError}
                          </p>
                        )}
                        {!isLoadingProviders && providers.length > 0 && (
                          <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                            ✓ {providers.filter(p => p.available).length} de {providers.length} provider{providers.length > 1 ? 's' : ''} disponible{providers.filter(p => p.available).length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3"
                        disabled={isGenerating || !selectedFile}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Procesando PDF...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generar desde PDF
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Info & Results */}
          <div className="space-y-6">
            {/* Providers Info */}
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardHeader className="border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-gaming text-sm">PROVIDERS IA</CardTitle>
                  <Dialog open={isApiKeysDialogOpen} onOpenChange={setIsApiKeysDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-400/60 text-amber-200 hover:bg-amber-400/20 hover:text-amber-100"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Config API
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-2 border-purple-500/50 text-white sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="font-gaming text-2xl text-amber-400 flex items-center gap-2">
                          <Settings className="h-6 w-6" />
                          CONFIGURAR CLAVES API
                        </DialogTitle>
                        <DialogDescription className="text-purple-200">
                          Configura tus claves de API para los proveedores de IA. Las claves se guardan localmente en tu navegador.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="claude-key" className="text-purple-200 font-gaming flex items-center gap-2">
                            <Badge className="bg-purple-600">Claude</Badge>
                            Anthropic API Key
                          </Label>
                          <Input
                            id="claude-key"
                            type="password"
                            placeholder="sk-ant-..."
                            value={apiKeys.claude}
                            onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
                            className="bg-slate-800 border-purple-500/50 text-white placeholder:text-slate-500"
                          />
                          <p className="text-xs text-slate-400">
                            Obtén tu clave en: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">console.anthropic.com</a>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gemini-key" className="text-purple-200 font-gaming flex items-center gap-2">
                            <Badge className="bg-blue-600">Gemini</Badge>
                            Google AI API Key
                          </Label>
                          <Input
                            id="gemini-key"
                            type="password"
                            placeholder="AIza..."
                            value={apiKeys.gemini}
                            onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                            className="bg-slate-800 border-purple-500/50 text-white placeholder:text-slate-500"
                          />
                          <p className="text-xs text-slate-400">
                            Obtén tu clave en: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">aistudio.google.com</a>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="openai-key" className="text-purple-200 font-gaming flex items-center gap-2">
                            <Badge className="bg-green-600">OpenAI</Badge>
                            OpenAI API Key
                          </Label>
                          <Input
                            id="openai-key"
                            type="password"
                            placeholder="sk-..."
                            value={apiKeys.openai}
                            onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                            className="bg-slate-800 border-purple-500/50 text-white placeholder:text-slate-500"
                          />
                          <p className="text-xs text-slate-400">
                            Obtén tu clave en: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">platform.openai.com</a>
                          </p>
                        </div>

                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mt-4">
                          <p className="text-xs text-amber-200">
                            🔒 <strong>Seguridad:</strong> Las claves se guardan solo en tu navegador (localStorage). Nunca se envían a nuestro servidor. Solo se usan para comunicarte directamente con los proveedores de IA.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsApiKeysDialogOpen(false)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveApiKeys}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-gaming"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Claves
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {isLoadingProviders ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                    <p className="text-sm text-gray-400">Cargando proveedores...</p>
                  </div>
                ) : providersError ? (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-200">
                    <p className="mb-3 font-gaming uppercase tracking-widest">{providersError}</p>
                    <Button
                      variant="outline"
                      onClick={() => void loadProviders()}
                      className="border-amber-400/60 text-amber-200 hover:bg-amber-400/20"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                  </div>
                ) : providers.length === 0 ? (
                  <div className="rounded-lg border border-purple-500/30 bg-slate-900/60 p-4 text-center text-sm text-purple-200">
                    No hay proveedores configurados actualmente. Usa la opción automática.
                  </div>
                ) : (
                  providers.map((p) => (
                    <div key={p.name} className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-slate-900/50 p-3">
                      <div>
                        <p className="text-sm font-gaming text-white">{p.displayName}</p>
                        <p className="text-xs text-purple-300">${p.costPerQuestion}/pregunta</p>
                      </div>
                      <Badge className={p.available ? 'bg-green-600' : 'bg-red-600/50'}>
                        {p.available ? '✓' : '✗'}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {generatedQuestions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="game-card bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-5 border border-green-600 glow-green"
              >
                <h3 className="text-xl font-bold text-white mb-3 flex items-center font-orbitron">
                  <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                  ¡Quiz Generado!
                </h3>
                <div className="space-y-2 text-sm text-white">
                  <p><strong>Título:</strong> {generatedQuestions.questionSet.title}</p>
                  <p><strong>Preguntas:</strong> {generatedQuestions.questionSet.total_questions}</p>
                  <p><strong>Provider:</strong> {generatedQuestions.aiMetadata?.provider}</p>
                  <p><strong>Tiempo:</strong> {generatedQuestions.aiMetadata?.processingTime}ms</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={viewQuizDetails}
                    className="flex-1 bg-white text-green-900 hover:bg-gray-100"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Quiz
                  </Button>
                  <Button
                    onClick={() => navigate('/question-sets')}
                    variant="outline"
                    className="flex-1 border-white text-white hover:bg-white/10"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Mis Quizzes
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Último quiz generado */}
            {hasLastGeneratedQuiz && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="game-card bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-5 border border-amber-600"
              >
                <h3 className="text-lg font-bold text-white mb-2 flex items-center font-gaming">
                  <Eye className="mr-2 h-5 w-5 text-amber-400" />
                  Último Quiz Generado
                </h3>
                <p className="text-sm text-amber-200 mb-4">
                  Vuelve a tu último quiz sin guardarlo para seguir editándolo
                </p>
                <Button
                  onClick={goToLastPreview}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-600"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Último Preview
                </Button>
              </motion.div>
            )}

            {/* Progress Bar */}
            {isGenerating && (
              <Card className="bg-slate-800 border-2 border-yellow-500/30">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span className="font-gaming">{progressMessage}</span>
                      <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
                    </div>
                    <Progress value={progress} className="w-full h-3" />
                    <p className="text-xs text-gray-400 text-center">
                      {progress < 100 ? `${progress}% completado` : '¡Completado!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
