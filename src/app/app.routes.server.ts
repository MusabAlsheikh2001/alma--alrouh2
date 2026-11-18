import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  ...['campaigns/:slug', 'programs/:slug', 'sessions/:slug', 'updates/:slug'].map(
    (path): ServerRoute => ({ path, renderMode: RenderMode.Client }),
  ),
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
