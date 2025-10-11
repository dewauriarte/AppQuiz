import React from 'react';

export const StaticTest: React.FC = () => {
  return (
    <div>
      <style>{`
        .test-bg { background-color: #3b82f6; color: white; padding: 1rem; margin: 1rem; }
        .test-red { background-color: #ef4444; color: white; padding: 1rem; margin: 1rem; }
      `}</style>
      <div className="test-bg">Fondo azul con estilos inline</div>
      <div className="test-red">Fondo rojo con estilos inline</div>
      <div className="bg-blue-500 text-white p-4 m-4">Fondo azul estándar</div>
      <div className="bg-red-500 text-white p-4 m-4">Fondo rojo estándar</div>
    </div>
  );
};
