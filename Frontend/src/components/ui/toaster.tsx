/**
 * Toaster Component
 * Display toast notifications
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-md pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="pointer-events-auto"
          >
            <div
              className={cn(
                'bg-white dark:bg-slate-800 border shadow-lg rounded-lg p-4 flex items-start gap-3',
                toast.variant === 'destructive' && 'border-red-500 bg-red-50 dark:bg-red-950'
              )}
            >
              {toast.variant === 'destructive' ? (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{toast.title}</h3>
                {toast.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {toast.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismiss(toast.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

