import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const TestStyles: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-md mx-auto shadow-lg border border-gray-200">
        <CardHeader className="bg-gray-100">
          <CardTitle className="text-gray-800">Test de Estilos Básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Botón Primario (Clases estándar)
          </Button>
          <Button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50">
            Botón Outline (Clases estándar)
          </Button>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">Texto en área muted (Clases estándar)</p>
          </div>
          <div className="p-4 bg-gray-200 rounded-lg">
            <p className="text-gray-800">Texto en área accent (Clases estándar)</p>
          </div>

          {/* Ahora probar con clases personalizadas */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Test con clases personalizadas:</h3>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Botón con clases personalizadas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
