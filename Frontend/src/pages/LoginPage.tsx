import { useEffect } from 'react';
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
import { LogIn, Gamepad2, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, 'Usuario debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      toast.success('¡Bienvenido de vuelta, guerrero!');
      // Navigation handled by useEffect above
    } catch (error: any) {
      // Client-side error handling
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md game-card border-3 border-indigo-500 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-8 border-b border-indigo-500/30 bg-gradient-to-b from-indigo-950/50 to-transparent">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl level-badge">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-gaming text-retro text-white">
            APP<span className="text-indigo-400">QUIZ</span>
          </CardTitle>
          <p className="text-sm text-gray-400 font-medium">Inicia sesión para comenzar tu aventura</p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de guerrero"
                className="bg-slate-800/50 border-2 border-indigo-500/30 text-white placeholder:text-gray-500 focus:border-indigo-500 transition-all"
                {...register('username')}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu clave secreta"
                className="bg-slate-800/50 border-2 border-indigo-500/30 text-white placeholder:text-gray-500 focus:border-indigo-500 transition-all"
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-gaming text-lg shadow-lg hover:shadow-xl transition-all border-2 border-indigo-400 btn-press pulse-glow"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  CARGANDO...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  INICIAR SESIÓN
                </span>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-indigo-500/30">
            <p className="text-sm text-gray-400">
              ¿Nuevo en AppQuiz?{' '}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Crea tu cuenta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
