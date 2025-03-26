import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const DeepLinkRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business');
  const alreadyRedirected = searchParams.get('redirected'); // para evitar loops
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!businessId || alreadyRedirected) return;

    const userAgent = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    // URL para redirigir (Universal Link)
    const universalLink = `https://www.ravekh.com/open/servicebybusiness/${businessId}`;

    if (isIOS) {
      // Intenta abrir la app vía Universal Link
      window.location.href = universalLink;
      // Fallback: si la app no se abre, después de 3 seg muestra el botón para ir a la App Store
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isAndroid) {
      // En Android usamos el esquema personalizado
      window.location.href = `myapp://open/servicebybusiness/${businessId}`;
      const timer = setTimeout(() => {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.agendat';
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Otros dispositivos: redirige a la web
      window.location.href = 'https://ravekh.com';
    }
  }, [businessId, alreadyRedirected]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-indigo-100 p-6">
      <p className="text-3xl font-extrabold text-gray-900 mb-8">
        Redirigiendo a la app...
      </p>
      {showFallback && (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Ups!</h2>
          <p className="text-gray-600 mb-6">
            No se pudo abrir la app. Descárgala para disfrutar de una experiencia óptima.
          </p>
          <a
            href="https://apps.apple.com/mx/app/agenda-ravekh/id6743504081"
            className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Descargar App
          </a>
        </div>
      )}
    </div>
  );
};

export default DeepLinkRedirect;
