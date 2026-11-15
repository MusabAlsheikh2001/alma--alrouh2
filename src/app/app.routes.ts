import type { Routes } from '@angular/router';

const SITE = 'Alma Alrouh';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: `${SITE}: Free Mental Health Support in Peshawar`,
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'about',
    title: `About | ${SITE}`,
    loadComponent: () => import('./pages/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'programs',
    title: `Programs | ${SITE}`,
    loadComponent: () => import('./pages/programs.page').then((m) => m.ProgramsPage),
  },
  {
    path: 'campaigns',
    title: `Campaigns | ${SITE}`,
    loadComponent: () => import('./pages/campaigns.page').then((m) => m.CampaignsPage),
  },
  {
    path: 'get-involved',
    title: `Get involved | ${SITE}`,
    loadComponent: () => import('./pages/involved.page').then((m) => m.InvolvedPage),
  },
  {
    path: 'contact',
    title: `Contact | ${SITE}`,
    loadComponent: () => import('./pages/contact.page').then((m) => m.ContactPage),
  },
  {
    path: 'faqs',
    title: `FAQs | ${SITE}`,
    data: { key: 'faqs' },
    loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPageComponent),
  },
  {
    path: 'terms',
    title: `Terms and Conditions | ${SITE}`,
    data: { key: 'terms' },
    loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPageComponent),
  },
  {
    path: 'privacy',
    title: `Privacy Policy | ${SITE}`,
    data: { key: 'privacy' },
    loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPageComponent),
  },
  {
    path: '**',
    title: `Page not found | ${SITE}`,
    loadComponent: () => import('./pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
