import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Users,
  UserPlus,
  UserMinus,
  Search
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Student {
  list_id: number;
  user_id: number;
  nickname: string | null;
  added_at: string;
  student: {
    user_id: number;
    username: string;
    display_name: string | null;
    email: string | null;
    created_at: string;
  };
}

interface ClassList {
  list_id: number;
  name: string;
  grade_level: string | null;
  teacher_id: number;
  created_at: string;
  updated_at: string;
  teacher: {
    user_id: number;
    username: string;
    display_name: string | null;
  };
  class_list_students: Student[];
}

export default function ClassListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classList, setClassList] = useState<ClassList | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [studentUsername, setStudentUsername] = useState('');
  const [studentNickname, setStudentNickname] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadClassList();
  }, [id]);

  const loadClassList = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/lists/${id}`);
      setClassList(data.data);
    } catch (error: any) {
      console.error('Error loading class list:', error);
      toast.error('Error al cargar la lista');
      navigate('/lists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!studentUsername.trim()) {
      toast.error('Ingresa el username del estudiante');
      return;
    }

    try {
      setIsAdding(true);

      // Primero buscar el estudiante por username
      const { data: searchResult } = await api.get(`/auth/search-user?username=${studentUsername}`);

      if (!searchResult.data) {
        toast.error('Usuario no encontrado');
        return;
      }

      const userId = searchResult.data.user_id;

      // Agregar a la lista
      await api.post(`/lists/${id}/students`, {
        students: [
          {
            user_id: userId,
            nickname: studentNickname || undefined,
          },
        ],
      });

      toast.success('Estudiante agregado exitosamente');
      setIsAddDialogOpen(false);
      setStudentUsername('');
      setStudentNickname('');
      loadClassList();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast.error(error.response?.data?.message || 'Error al agregar estudiante');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      await api.delete(`/lists/${id}/students/${studentToRemove.id}`);
      toast.success('Estudiante removido exitosamente');
      setIsRemoveDialogOpen(false);
      setStudentToRemove(null);
      loadClassList();
    } catch (error: any) {
      console.error('Error removing student:', error);
      toast.error(error.response?.data?.message || 'Error al remover estudiante');
    }
  };

  const openRemoveDialog = (studentId: number, studentName: string) => {
    setStudentToRemove({ id: studentId, name: studentName });
    setIsRemoveDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/lists/${id}`);
      toast.success('Lista eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      navigate('/lists');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar la lista');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!classList) {
    return null;
  }

  const filteredStudents = classList.class_list_students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student.username.toLowerCase().includes(searchLower) ||
      student.student.display_name?.toLowerCase().includes(searchLower) ||
      student.nickname?.toLowerCase().includes(searchLower)
    );
  });

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

          <div className="game-card bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 border-2 border-indigo-500 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center level-badge shadow-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-gaming text-white mb-2">
                    {classList.name}
                  </h1>
                  <p className="text-indigo-200">
                    {classList.grade_level || 'Sin nivel especificado'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-indigo-600">
                      {classList.class_list_students.length} estudiantes
                    </Badge>
                    <Badge className="bg-purple-600">
                      👤 {classList.teacher.display_name || classList.teacher.username}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-2 border-green-500/50 text-white">
                    <DialogHeader>
                      <DialogTitle className="font-gaming text-2xl text-green-400">
                        AGREGAR ESTUDIANTE
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm text-purple-200 font-gaming mb-2 block">
                          Username del Estudiante *
                        </label>
                        <Input
                          value={studentUsername}
                          onChange={(e) => setStudentUsername(e.target.value)}
                          placeholder="Ej: juan.perez"
                          className="bg-slate-800 border-purple-500/50 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-purple-200 font-gaming mb-2 block">
                          Apodo (Opcional)
                        </label>
                        <Input
                          value={studentNickname}
                          onChange={(e) => setStudentNickname(e.target.value)}
                          placeholder="Ej: Juanito"
                          className="bg-slate-800 border-purple-500/50 text-white"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="border-gray-500 text-gray-400"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddStudent}
                        disabled={isAdding}
                        className="bg-gradient-to-r from-green-600 to-emerald-600"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Agregando...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Agregar
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={() => navigate(`/lists/${id}/edit`)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-orange-600 hover:to-yellow-600"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-rose-600 hover:to-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-800 border-2 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-400" />
                <Input
                  placeholder="Buscar estudiante por nombre o username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 text-white border-purple-500/50"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800 border-2 border-indigo-500/30">
            <CardHeader className="border-b border-indigo-500/30">
              <CardTitle className="text-white font-gaming">
                ESTUDIANTES ({filteredStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400 font-gaming">
                    {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes en esta lista'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border-2 border-purple-500/20 hover:border-purple-500/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-gaming text-white text-lg">
                          {student.student.display_name?.charAt(0) || student.student.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            {student.student.display_name || student.student.username}
                            {student.nickname && (
                              <Badge className="ml-2 bg-blue-600">"{student.nickname}"</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-400">
                            @{student.student.username}
                            {student.student.email && ` • ${student.student.email}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Agregado: {new Date(student.added_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRemoveDialog(student.user_id, student.student.display_name || student.student.username)}
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Diálogo de confirmación para eliminar lista */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-2 border-red-500/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-gaming text-2xl text-red-400 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              ELIMINAR LISTA
            </AlertDialogTitle>
            <AlertDialogDescription className="text-purple-200">
              ¿Estás seguro de eliminar esta lista? Se eliminarán todos los estudiantes asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-rose-600 hover:to-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Lista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para remover estudiante */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-2 border-red-500/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-gaming text-2xl text-red-400 flex items-center gap-2">
              <UserMinus className="w-6 h-6" />
              REMOVER ESTUDIANTE
            </AlertDialogTitle>
            <AlertDialogDescription className="text-purple-200">
              ¿Estás seguro de remover a <strong className="text-white">{studentToRemove?.name}</strong> de esta lista?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-rose-600 hover:to-red-600"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remover Estudiante
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
