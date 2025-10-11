import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { UserPlus, GraduationCap, User, Sparkles, Shield } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Usuario debe tener al menos 3 caracteres').max(50),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional().or(z.literal('')),
  role: z.enum(['teacher', 'student']),
  birthdate: z.string().optional(),
  teacherArea: z.string().optional(),
  teacherSubject: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
  ageConfirmation: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterInput = z.infer<typeof registerSchema>;

const teacherAreas = [
  'Matemáticas',
  'Ciencias',
  'Lenguaje',
  'Historia',
  'Geografía',
  'Arte',
  'Música',
  'Educación Física',
  'Tecnología',
  'Idiomas',
];

const teacherSubjects = {
  'Matemáticas': ['Álgebra', 'Geometría', 'Cálculo', 'Estadística'],
  'Ciencias': ['Física', 'Química', 'Biología', 'Ciencias Naturales'],
  'Lenguaje': ['Literatura', 'Gramática', 'Escritura Creativa', 'Comprensión Lectora'],
  'Historia': ['Historia Universal', 'Historia Nacional', 'Historia Antigua', 'Historia Moderna'],
  'Geografía': ['Geografía Física', 'Geografía Humana', 'Cartografía'],
  'Arte': ['Pintura', 'Escultura', 'Arte Digital', 'Historia del Arte'],
  'Música': ['Teoría Musical', 'Instrumentos', 'Canto', 'Historia de la Música'],
  'Educación Física': ['Deportes', 'Atletismo', 'Gimnasia', 'Salud'],
  'Tecnología': ['Programación', 'Robótica', 'Diseño Digital', 'Informática'],
  'Idiomas': ['Inglés', 'Francés', 'Alemán', 'Portugués'],
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('student');
  const [selectedArea, setSelectedArea] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
      acceptTerms: false,
    },
  });

  const birthdate = watch('birthdate');

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Calculate age for verification
  const calculateAge = (birthdate: string): number => {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = birthdate ? calculateAge(birthdate) : 0;
  const isMinor = age > 0 && age < 18;

  const onSubmit = async (data: RegisterInput) => {
    try {
      // Age verification
      if (data.role === 'student' && isMinor && !data.ageConfirmation) {
        toast.error('Los menores de edad necesitan confirmación de un adulto');
        return;
      }

      await registerUser(data);
      toast.success('¡Cuenta creada! Bienvenido a la arena');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-2xl game-card border-3 border-indigo-500 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-6 border-b border-indigo-500/30 bg-gradient-to-b from-indigo-950/50 to-transparent">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl level-badge">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-gaming text-retro text-white">
            CREAR CUENTA
          </CardTitle>
          <p className="text-sm text-gray-400">Únete a la batalla del conocimiento</p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-gaming text-gray-300">SELECCIONA TU CLASE</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('student');
                    setValue('role', 'student');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'student'
                      ? 'border-blue-500 bg-blue-950/30 shadow-lg glow-blue'
                      : 'border-gray-600 bg-slate-800/30 hover:border-gray-500'
                  }`}
                >
                  <User className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'student' ? 'text-blue-400' : 'text-gray-500'}`} />
                  <p className={`font-gaming text-sm ${selectedRole === 'student' ? 'text-blue-300' : 'text-gray-400'}`}>
                    ESTUDIANTE
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('teacher');
                    setValue('role', 'teacher');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'teacher'
                      ? 'border-purple-500 bg-purple-950/30 shadow-lg glow-purple'
                      : 'border-gray-600 bg-slate-800/30 hover:border-gray-500'
                  }`}
                >
                  <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'teacher' ? 'text-purple-400' : 'text-gray-500'}`} />
                  <p className={`font-gaming text-sm ${selectedRole === 'teacher' ? 'text-purple-300' : 'text-gray-400'}`}>
                    PROFESOR
                  </p>
                </button>
              </div>
              <input type="hidden" {...register('role')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                  Usuario *
                </Label>
                <Input
                  id="username"
                  placeholder="nombre_guerrero"
                  className="bg-slate-800/50 border-2 border-indigo-500/30 text-white"
                  {...register('username')}
                  disabled={isSubmitting}
                />
                {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium text-gray-300">
                  Nombre Completo
                </Label>
                <Input
                  id="displayName"
                  placeholder="Tu nombre real"
                  className="bg-slate-800/50 border-2 border-indigo-500/30 text-white"
                  {...register('displayName')}
                  disabled={isSubmitting}
                />
                {errors.displayName && <p className="text-xs text-red-400">{errors.displayName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email {selectedRole === 'teacher' && '*'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-slate-800/50 border-2 border-indigo-500/30 text-white"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Teacher-specific fields */}
            {selectedRole === 'teacher' && (
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-purple-950/20 rounded-lg border border-purple-500/30">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-gaming text-purple-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    ÁREA DE ENSEÑANZA *
                  </Label>
                  <select
                    className="w-full bg-slate-800/50 border-2 border-purple-500/30 text-white rounded-md p-2"
                    {...register('teacherArea')}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setValue('teacherSubject', '');
                    }}
                  >
                    <option value="">Selecciona un área</option>
                    {teacherAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {selectedArea && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-gaming text-purple-300">
                      MATERIA *
                    </Label>
                    <select
                      className="w-full bg-slate-800/50 border-2 border-purple-500/30 text-white rounded-md p-2"
                      {...register('teacherSubject')}
                    >
                      <option value="">Selecciona una materia</option>
                      {teacherSubjects[selectedArea as keyof typeof teacherSubjects]?.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Birthdate - Student only */}
            {selectedRole === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="text-sm font-medium text-gray-300">
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  className="bg-slate-800/50 border-2 border-indigo-500/30 text-white"
                  {...register('birthdate')}
                  disabled={isSubmitting}
                />
                {isMinor && (
                  <div className="p-3 bg-yellow-950/30 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-yellow-300 mb-2">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Eres menor de edad ({age} años)
                    </p>
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('ageConfirmation')}
                        className="w-4 h-4"
                      />
                      <span>Confirmo que tengo permiso de un adulto para registrarme</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Password */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Contraseña *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="bg-slate-800/50 border-2 border-indigo-500/30 text-white"
                  {...register('password')}
                  disabled={isSubmitting}
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                  Confirmar Contraseña *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  className="bg-slate-800/50 border-2 border-indigo-500/30 text-white"
                  {...register('confirmPassword')}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-indigo-500/30">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="mt-1 w-5 h-5 rounded border-indigo-500"
                />
                <span className="text-sm text-gray-300">
                  Acepto los{' '}
                  <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                    Términos y Condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                    Política de Privacidad
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="text-xs text-red-400">{errors.acceptTerms.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-gaming text-lg shadow-lg hover:shadow-xl transition-all border-2 border-purple-400 btn-press pulse-glow"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  CREANDO CUENTA...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  CREAR CUENTA
                </span>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-indigo-500/30">
            <p className="text-sm text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
