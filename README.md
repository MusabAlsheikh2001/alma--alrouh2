# AlmaAngularTemp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## SEO and deployment

`npm run build` regenerates the sitemap, then prerenders every page to static HTML in `dist/alma-alrouh/browser/` (for example `about/index.html`). Upload that folder to any static host.

- **Domain:** `https://alma-alrouh.com`. It is set in `src/app/seo.service.ts` (`SITE_URL`), `src/index.html`, `public/robots.txt` and `scripts/generate-sitemap.mjs`.
- **Page titles, descriptions and social text:** the `seo` block in `src/i18n/en.ts` and `ar.ts`.
- **Structured data:** the sitewide NGO schema is in `src/index.html`. Per-page schema (WebPage, BreadcrumbList, FAQPage, AboutPage, Events for campaigns and online sessions) comes from `src/app/seo.service.ts`.
- **Sitemap:** `scripts/generate-sitemap.mjs` writes `public/sitemap.xml`, listing every page and every campaign photo. Run it on its own with `npm run sitemap`. Add new pages to its `PAGES` list.
- **Unknown URLs:** configure the host to serve `index.csr.html` with a 404 status for paths that have no prerendered page, so the app's "page not found" view shows.
- **After deploying:** submit `https://alma-alrouh.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
