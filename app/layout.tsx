import type { Metadata } from 'next';
import './globals.css';
import GlobalAiAssistant from '@/components/ai/GlobalAiAssistant';

export const metadata: Metadata = {
  title: 'Suple ERP — Dashboard',
  description: 'Enterprise Resource Planning for Cercha Studio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        {/*
          GlobalAiAssistant vive FUERA del DashboardLayout.
          Al estar aquí, en el layout raíz, es visible en absolutamente
          todas las rutas de la app sin importar en qué vista esté el usuario.
        */}
        <GlobalAiAssistant />
      </body>
    </html>
  );
}
