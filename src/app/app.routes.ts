import type { Routes } from '@angular/router';

// Titles, descriptions and structured data come from Seo (src/app/seo.service.ts),
// keyed by `data.seo`, in the visitor's language.

export const routes: Routes = [
  {
    path: '',
    data: { seo: 'home' },
    pathMatch: 'full',
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'about',
    data: { seo: 'about' },
    loadComponent: () => import('./pages/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'programs',
    data: { seo: 'programs' },
    loadComponent: () => import('./pages/programs.page').then((m) => m.ProgramsPage),
  },
  {
    path: 'campaigns',
    data: { seo: 'campaigns' },
    loadComponent: () => import('./pages/campaigns.page').then((m) => m.CampaignsPage),
  },
  {
    path: 'get-involved',
    data: { seo: 'involved' },
    loadComponent: () => import('./pages/involved.page').then((m) => m.InvolvedPage),
  },
  {
    path: 'contact',
    data: { seo: 'contact' },
    loadComponent: () => import('./pages/contact.page').then((m) => m.ContactPage),
  },
  {
    path: 'faqs',
    data: { seo: 'faqs', key: 'faqs' },
    loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPageComponent),
  },
  {
    path: 'terms',
    data: { seo: 'terms', key: 'terms' },
    loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPageComponent),
  },
  {
    path: 'privacy',
    data: { seo: 'privacy', key: 'privacy' },
    loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPageComponent),
  },
  ...(['campaigns', 'programs', 'sessions', 'updates'] as const).map((section) => ({
    path: section + '/:slug',
    data: {
      contentKind: (
        { campaigns: 'campaign', programs: 'program', sessions: 'event', updates: 'page' } as const
      )[section],
    },
    loadComponent: () => import('./velobase/content-detail').then((m) => m.ContentDetail),
  })),
  {
    path: '**',
    data: { seo: 'notFound' },
    loadComponent: () => import('./pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
