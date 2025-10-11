import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Save,
  Loader2,
  Users
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const createClassListSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  grade_level: z.string().optional(),
});

type CreateClassListInput = z.infer<typeof createClassListSchema>;

export default function CreateClassListPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateClassListInput>({
    resolver: zodResolver(createClassListSchema),
  });

  const onSubmit = async (data: CreateClassListInput) => {
    try {
      setIsSaving(true);
      const { data: response } = await api.post('/lists', data);
      toast.success('¡Lista creada exitosamente!');
      navigate(`/lists/${response.data.list_id}`);
    } catch (error: any) {
      console.error('Error creating class list:', error);
      toast.error(error.response?.data?.message || 'Error al crear la lista');
    } finally {
      setIsSaving(false);
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
            onClick={() => navigate('/lists')} 
            className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="game-card bg-gradient-to-br from-blue-900 to-cyan-900 rounded-xl p-6 border-2 border-blue-500 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center level-badge shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-gaming text-white">
                  CREAR NUEVA LISTA
                </h1>
                <p className="text-blue-200">
                  Organiza un nuevo grupo de estudiantes
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardHeader className="border-b border-purple-500/30">
                <CardTitle className="text-white font-gaming">INFORMACIÓN DE LA LISTA</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="name" className="text-purple-200 font-gaming mb-2 block">
                    Nombre de la Lista *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ej: Matemáticas 10A, Biología 2024"
                    className="bg-slate-900 text-white border-purple-500/50"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="grade_level" className="text-purple-200 font-gaming mb-2 block">
                    Grado/Nivel (Opcional)
                  </Label>
                  <Input
                    id="grade_level"
                    {...register('grade_level')}
                    placeholder="Ej: 10mo Grado, Secundaria, Universidad"
                    className="bg-slate-900 text-white border-purple-500/50"
                  />
                </div>

                <div className="bg-blue-950/30 border-2 border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>Consejo:</strong> Después de crear la lista, podrás agregar estudiantes manualmente o importarlos desde un archivo Excel.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/lists')}
              className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600 min-w-32"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Crear Lista
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

