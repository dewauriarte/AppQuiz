import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Loader2,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ClassList {
  list_id: number;
  name: string;
  grade_level: string | null;
  created_at: string;
  updated_at: string;
  teacher: {
    user_id: number;
    username: string;
    display_name: string | null;
  };
  _count: {
    class_list_students: number;
  };
}

export default function ClassListsPage() {
  const navigate = useNavigate();
  const [classLists, setClassLists] = useState<ClassList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadClassLists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (search) params.append('search', search);

      const { data } = await api.get(`/lists?${params.toString()}`);
      setClassLists(data.data);
      setTotal(data.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error loading class lists:', error);
      toast.error('Error al cargar las listas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassLists();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadClassLists();
  };

  const handleDelete = async (listId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta lista? Se eliminarán todos los estudiantes asociados.')) return;

    try {
      await api.delete(`/lists/${listId}`);
      toast.success('Lista eliminada exitosamente');
      loadClassLists();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar la lista');
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
          
          <div className="game-card bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl p-6 border-2 border-indigo-500 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center level-badge shadow-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-gaming text-white">
                    MIS LISTAS
                  </h1>
                  <p className="text-indigo-200">
                    Organiza y gestiona tus grupos de estudiantes
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/lists/import')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Importar Excel
                </Button>
                <Button
                  onClick={() => navigate('/lists/create')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Lista
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
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por nombre o grado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-slate-900 text-white border-purple-500/50"
                />
                <Button onClick={handleSearch} variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lists Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : classLists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-gaming text-white mb-2">
                  NO HAY LISTAS AÚN
                </h3>
                <p className="text-gray-400 mb-6">
                  Crea tu primera lista de estudiantes o importa desde Excel
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/lists/import')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Importar Excel
                  </Button>
                  <Button
                    onClick={() => navigate('/lists/create')}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classLists.map((list, index) => (
              <motion.div
                key={list.list_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Card className="bg-slate-800 border-2 border-indigo-500/30 hover:border-indigo-500 transition-all game-card group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white font-gaming text-lg mb-2">
                          {list.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                          {list.grade_level || 'Sin nivel especificado'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-indigo-600">
                        <Users className="w-3 h-3 mr-1" />
                        {list._count.class_list_students} estudiantes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-400 mb-4">
                      <p>👤 {list.teacher.display_name || list.teacher.username}</p>
                      <p>📅 Creada: {new Date(list.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/lists/${list.list_id}`)}
                        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/lists/${list.list_id}/edit`)}
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(list.list_id)}
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 12 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center gap-2"
          >
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-white font-gaming">
              Página {page} de {Math.ceil(total / 12)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
            >
              Siguiente
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

