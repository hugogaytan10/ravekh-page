import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const DeepLinkRedirect = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business');
  const alreadyRedirected = searchParams.get('redirected'); // parámetro para evitar el loop

  useEffect(() => {
    // Si no hay businessId o ya se redirigió, no hacer nada
    if (!businessId || alreadyRedirected) return;

    const userAgent = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    // Agrega el parámetro 'redirected' para no volver a ejecutar la redirección
    const universalLink = `https://www.ravekh.com/open/servicebybusiness/${businessId}`;

    if (isIOS) {
      // Redirige al universal link (si la app está instalada, se abrirá la app)
      window.location.href = universalLink;
      // Fallback: después de 3 segundos, si la app no se abre, redirige a App Store
      setTimeout(() => {
        window.location.href = 'https://apps.apple.com/mx/app/agenda-ravekh/id6743504081'; // Reemplaza con tu App Store real
      }, 3000);
    } else if (isAndroid) {
      // En Android se usa el esquema personalizado
      window.location.href = `myapp://open/servicebybusiness/${businessId}`;
      setTimeout(() => {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.agendat';
      }, 3000);
    } else {
      // Otros dispositivos: redirige a la web
      window.location.href = 'https://ravekh.com';
    }
  }, [businessId, alreadyRedirected]);

  return <p>Redirigiendo a la app...</p>;
};

export default DeepLinkRedirect;
