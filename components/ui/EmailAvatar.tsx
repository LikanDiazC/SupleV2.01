'use client';

import { useState, useMemo } from 'react';
import md5 from 'md5';

interface EmailAvatarProps {
  /** 
   * La cadena que viene del correo, puede ser:
   * "Juan Perez <juan@gmail.com>" o "juan@gmail.com"
   */
  rawSender: string;
  className?: string;
  size?: number;
}

export function EmailAvatar({ rawSender, className = '', size = 64 }: EmailAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // 1. Limpiamos y extraemos nombre/email con useMemo para no recalcular
  const { name, emailHash } = useMemo(() => {
    // Si la cadena tiene el formato "Nombre <correo@dominio.com>"
    const emailMatch = rawSender.match(/<([^>]+)>/);
    let email = emailMatch ? emailMatch[1] : rawSender;
    
    // El nombre a mostrar en caso de que fallback ui-avatars necesite (quitamos brackets, comillas y caracteres raros)
    let extractedName = rawSender.replace(/<[^>]+>/g, '').replace(/['"?]+/g, '').trim();
    // Si el nombre quedó vacío o lleno de símbolos inútiles, usamos la parte izquierda del correo
    if (!extractedName || extractedName.length < 2) {
      extractedName = email.split('@')[0];
    }

    // Gravatar pide MD5 en minúsculas y sin espacios
    const cleanedEmail = email.toLowerCase().trim();
    const hash = md5(cleanedEmail);

    return { name: extractedName, emailHash: hash };
  }, [rawSender]);

  // Construimos las URLs
  // d=404 obliga a Gravatar a tirar un error si no encuentra la foto.
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=404&s=${size}`;
  const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=${size}&bold=true`;

  return (
    <img
      // Si ya falló la carga (o si falla dinámicamente), mostramos UI-Avatars
      src={imageError ? uiAvatarUrl : gravatarUrl}
      alt={name}
      onError={() => setImageError(true)}
      className={`rounded-full object-cover shadow-sm ${className}`}
    />
  );
}
