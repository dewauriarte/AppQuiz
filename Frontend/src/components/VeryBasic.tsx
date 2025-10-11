import React from 'react';

export const VeryBasic: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  };

  const titleStyle: React.CSSProperties = {
    color: '#333',
    fontSize: '24px',
    marginBottom: '16px'
  };

  const textStyle: React.CSSProperties = {
    color: '#666',
    marginBottom: '16px'
  };

  const boxStyle: React.CSSProperties = {
    backgroundColor: '#ff6b6b',
    color: 'white',
    padding: '12px',
    margin: '12px 0',
    borderRadius: '4px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Componente Muy Básico</h1>
      <p style={textStyle}>Este componente debería funcionar si React está configurado correctamente.</p>
      <div style={boxStyle}>
        Estilo inline básico con colores
      </div>
    </div>
  );
};
