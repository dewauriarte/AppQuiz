import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  FileSpreadsheet,
  Upload,
  Loader2,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const importSchema = z.object({
  list_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  grade_level: z.string().optional(),
  auto_create_users: z.boolean().default(true),
});

type ImportInput = z.infer<typeof importSchema>;

interface ImportResult {
  classList: {
    list_id: number;
    name: string;
  };
  studentsAdded: number;
  studentsCreated: number;
  errors: any[];
  details: any[];
}

export default function ImportClassListPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ImportInput>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      auto_create_users: true,
    },
  });

  const autoCreate = watch('auto_create_users');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no debe exceder los 5MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no debe exceder los 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ImportInput) => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo Excel');
      return;
    }

    try {
      setIsImporting(true);
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('list_name', data.list_name);
      if (data.grade_level) formData.append('grade_level', data.grade_level);
      formData.append('auto_create_users', data.auto_create_users.toString());

      const { data: response } = await api.post('/lists/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data);
      toast.success('¡Estudiantes importados exitosamente!');
    } catch (error: any) {
      console.error('Error importing students:', error);
      toast.error(error.response?.data?.message || 'Error al importar estudiantes');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Nombre,Apellido,Username,Email,Nickname
Juan,Pérez,juan.perez,juan@example.com,Juanito
María,García,,maria@example.com,Mari
Pedro,López,pedro.lopez,,`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_estudiantes.csv';
    link.click();
    URL.revokeObjectURL(url);
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
          
          <div className="game-card bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-6 border-2 border-green-500 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center level-badge shadow-xl">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-gaming text-white">
                  IMPORTAR DESDE EXCEL
                </h1>
                <p className="text-green-200">
                  Carga múltiples estudiantes desde un archivo Excel
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800 border-2 border-blue-500/30">
              <CardHeader className="border-b border-blue-500/30">
                <CardTitle className="text-white font-gaming">📋 INSTRUCCIONES</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 text-blue-200">
                  <p className="flex items-start gap-2">
                    <span className="font-gaming text-blue-400">1.</span>
                    Tu archivo Excel debe contener las columnas: <strong>Nombre</strong> y <strong>Apellido</strong> (obligatorias)
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-gaming text-blue-400">2.</span>
                    Columnas opcionales: Username, Email, Nickname
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-gaming text-blue-400">3.</span>
                    Si Username no se proporciona, se generará automáticamente: nombre.apellido
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-gaming text-blue-400">4.</span>
                    Los estudiantes se crearán con contraseña temporal: <strong>Student123!</strong>
                  </p>
                </div>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="mt-4 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Plantilla
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800 border-2 border-purple-500/30">
                <CardHeader className="border-b border-purple-500/30">
                  <CardTitle className="text-white font-gaming">INFORMACIÓN DE LA LISTA</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="list_name" className="text-purple-200 font-gaming mb-2 block">
                      Nombre de la Lista *
                    </Label>
                    <Input
                      id="list_name"
                      {...register('list_name')}
                      placeholder="Ej: Matemáticas 10A"
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                    {errors.list_name && (
                      <p className="text-red-400 text-sm mt-1">{errors.list_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="grade_level" className="text-purple-200 font-gaming mb-2 block">
                      Grado/Nivel (Opcional)
                    </Label>
                    <Input
                      id="grade_level"
                      {...register('grade_level')}
                      placeholder="Ej: 10mo Grado"
                      className="bg-slate-900 text-white border-purple-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto_create_users"
                      {...register('auto_create_users')}
                      className="w-5 h-5 rounded border-purple-500 bg-slate-900"
                    />
                    <Label htmlFor="auto_create_users" className="text-purple-200 font-gaming cursor-pointer">
                      Crear usuarios automáticamente si no existen
                    </Label>
                  </div>

                  {!autoCreate && (
                    <div className="bg-amber-950/30 border-2 border-amber-500/30 rounded-lg p-3">
                      <p className="text-amber-200 text-sm">
                        ⚠️ Solo se agregarán estudiantes que ya existan en el sistema.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800 border-2 border-green-500/30">
                <CardHeader className="border-b border-green-500/30">
                  <CardTitle className="text-white font-gaming">ARCHIVO EXCEL</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div
                    className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-green-500 rounded-lg bg-green-950/20 text-green-200 cursor-pointer hover:border-green-400 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mb-4" />
                    <p className="text-lg font-gaming mb-2">Arrastra tu Excel aquí o haz clic</p>
                    <p className="text-sm text-gray-400">Formatos: .xlsx, .xls (Máximo 5MB)</p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-green-950/30 border border-green-500/30 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-400" />
                        <span className="text-green-200 font-medium">{selectedFile.name}</span>
                        <Badge className="bg-green-600">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearFile}
                        className="text-red-400 hover:text-red-300"
                      >
                        Quitar
                      </Button>
                    </div>
                  )}
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
                onClick={() => navigate('/lists')}
                className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isImporting || !selectedFile}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 min-w-32"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Results */}
          {importResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-800 border-2 border-green-500">
                <CardHeader className="border-b border-green-500/30">
                  <CardTitle className="text-white font-gaming flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    RESULTADO DE LA IMPORTACIÓN
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-950/30 rounded-xl border-2 border-green-500/30">
                      <p className="text-xs font-gaming text-green-300 mb-1">AGREGADOS</p>
                      <p className="text-3xl font-gaming text-green-400">{importResult.studentsAdded}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-950/30 rounded-xl border-2 border-blue-500/30">
                      <p className="text-xs font-gaming text-blue-300 mb-1">CREADOS</p>
                      <p className="text-3xl font-gaming text-blue-400">{importResult.studentsCreated}</p>
                    </div>
                    <div className="text-center p-4 bg-red-950/30 rounded-xl border-2 border-red-500/30">
                      <p className="text-xs font-gaming text-red-300 mb-1">ERRORES</p>
                      <p className="text-3xl font-gaming text-red-400">{importResult.errors.length}</p>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="bg-red-950/30 border-2 border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <h4 className="font-gaming text-red-300">Errores Encontrados:</h4>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {importResult.errors.map((error, i) => (
                          <p key={i} className="text-sm text-red-200">
                            • {error.data?.nombre} {error.data?.apellido}: {error.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => navigate(`/lists/${importResult.classList.list_id}`)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600"
                  >
                    Ver Lista Creada
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

