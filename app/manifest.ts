import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'Hora Clara — Relatório de horas', short_name: 'Hora Clara',
    description: 'Registre suas horas e gere relatórios mensais.', lang: 'pt-BR',
    start_url: '/', scope: '/', display: 'standalone',
    background_color: '#f7f9fc', theme_color: '#3562b5',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
