import React from 'react';

export const DebugTest: React.FC = () => {
  console.log('DebugTest component is rendering');

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
        Debug Test Component
      </h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Este componente está renderizando correctamente.
      </p>
      <div style={{ backgroundColor: '#e0e0e0', padding: '10px', borderRadius: '5px' }}>
        <p>Si ves este mensaje, React y los estilos básicos están funcionando.</p>
      </div>
    </div>
  );
};
