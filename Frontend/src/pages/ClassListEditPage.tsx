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
import { ArrowLeft, Save, Loader2, Users } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const editSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  grade_level: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

interface ClassList {
  list_id: number;
  name: string;
  grade_level: string | null;
  teacher_id: number;
  created_at: string;
  updated_at: string;
}

export default function ClassListEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    loadClassList();
  }, [id]);

  const loadClassList = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/lists/${id}`);
      const classList: ClassList = data.data;

      setValue('name', classList.name);
      setValue('grade_level', classList.grade_level || '');
    } catch (error: any) {
      console.error('Error loading class list:', error);
      toast.error('Error al cargar la lista');
      navigate('/lists');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditFormData) => {
    try {
      setIsSaving(true);
      await api.put(`/lists/${id}`, {
        name: data.name,
        grade_level: data.grade_level || undefined,
      });
      toast.success('Lista actualizada exitosamente');
      navigate(`/lists/${id}`);
    } catch (error: any) {
      console.error('Error updating class list:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la lista');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
      </div>
    );
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
            onClick={() => navigate(`/lists/${id}`)}
            className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <div className="game-card bg-gradient-to-br from-yellow-900 to-orange-900 rounded-xl p-6 border-2 border-yellow-500 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center level-badge shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-gaming text-white">
                  EDITAR LISTA
                </h1>
                <p className="text-yellow-200">
                  Actualiza la información de la lista
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800 border-2 border-purple-500/30">
            <CardHeader className="border-b border-purple-500/30">
              <CardTitle className="text-white font-gaming">INFORMACIÓN DE LA LISTA</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label className="text-purple-200 font-gaming mb-2 block">
                    Nombre de la Lista *
                  </Label>
                  <Input
                    {...register('name')}
                    placeholder="Ej: Matemáticas 10A"
                    className="bg-slate-900 text-white border-purple-500/50 w-full"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-purple-200 font-gaming mb-2 block">
                    Grado/Nivel (Opcional)
                  </Label>
                  <Input
                    {...register('grade_level')}
                    placeholder="Ej: 10mo"
                    className="bg-slate-900 text-white border-purple-500/50 w-full"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/lists/${id}`)}
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
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
