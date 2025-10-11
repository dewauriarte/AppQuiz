import React from 'react';

export const BasicTest: React.FC = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Basic Test</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-blue-500 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Tailwind Básico
          </h1>
          <p className="text-gray-600 text-center mb-4">
            Este es un test básico con Tailwind CDN
          </p>
          <div className="space-y-2">
            <div className="bg-red-500 text-white p-2 rounded text-center">Rojo</div>
            <div className="bg-green-500 text-white p-2 rounded text-center">Verde</div>
            <div className="bg-yellow-500 text-black p-2 rounded text-center">Amarillo</div>
          </div>
        </div>
      </body>
    </html>
  );
};
