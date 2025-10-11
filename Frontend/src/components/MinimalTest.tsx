import React from 'react';

export const MinimalTest: React.FC = () => {
  return (
    <div>
      <h1>Hola Mundo</h1>
      <p>Este es un componente de prueba muy básico.</p>
      <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem' }}>
        Este div tiene estilos inline básicos
      </div>
    </div>
  );
};
