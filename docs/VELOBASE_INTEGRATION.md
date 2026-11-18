# Alma Alrouh × VeloBase runtime content

The existing Angular website now reads published VeloBase snapshots at runtime through `HttpClient`. No database access, API key, dashboard account, GitHub access or hosting credentials belong in the browser. Existing layouts, Arabic/English behavior where present, tools and static pages remain in their original project.

## Public contract

Base: `https://velobase.space/api/v1/public/alma-alrouh`

- `GET /content`: `kind`, `locale` (`ar`/`en`), URL-encoded `slug`, exact `category`, `page` (50 records/page). HTTP 200 with `data: []` is a valid empty published dataset.
- `GET /revision`: HTTP 200 JSON with `project.slug`, `contentAuthority`, opaque `revision`, `available` and `refreshAfterSeconds: 5`. Send the previous ETag with `If-None-Match`; HTTP 304 has no body.
- `GET /media/{id}`: public media only, enabled and published by the same workspace. External HTTPS media references are also supported. Nothing private is made public by adding its address to a draft.
- Full schemas and authentication requirements: [VeloBase OpenAPI](https://velobase.space/api/v1/openapi). These public routes need no credentials and reject writes. Administrative creation, review, publishing and withdrawal stay inside VeloBase with staff authorization.

`src/app/velobase/public-content.ts` validates responses, workspace identity, URLs and bounded pagination (up to 2,000 published records). It bypasses Angular transfer caching/service-worker requests, uses no-store HTTP requests, coalesces refreshes, checks revisions before/after loading, pauses polling in hidden tabs and refreshes on focus. Normal visible-tab polling is every five seconds. A failed/invalid response clears managed content and displays a retry state; it never silently substitutes an obsolete local copy.

## Controlled migration — requires owner approval

Nothing is published or migrated by installing this code. Existing public content continues when the API is empty and the section is not yet migrated. New, non-conflicting published records can appear alongside it. An existing legacy article/campaign with the same slug keeps its original presentation until that section is approved for migration.

After all intended records in a section are approved and published, and this connected frontend is deployed, the Platform Owner can open **VeloBase → workspace → Website → Approve a website section migration**. Approval is explicit and per content type; it requires at least one published record. It does not confirm live deployment. Afterwards the section is entirely VeloBase-managed: an empty result means empty, and withdrawal never restores a compiled local copy. Review/publication records are unchanged by this control. Do not activate this against an incomplete dataset.

## Existing hosting provider handoff

No hosting or DNS change is requested. Deploy this repository branch through the provider's existing process only after their approval.

```text
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Build root: .
Publish directory: `dist/alma-alrouh/browser` relative to that root. Keep all existing public assets and prerendered routes.

Dynamic paths: `/campaigns/:slug, /programs/:slug, /sessions/:slug, /updates/:slug`. If a requested extensionless path has no actual file/directory, serve `/index.csr.html` **with HTTP 200**. Existing prerendered `/<route>/index.html` must take precedence. Missing assets must retain real 404s; do not redirect JavaScript/image requests to HTML.

Equivalent existing-server rules (provider must choose its own platform):

```nginx
location / { try_files $uri $uri/index.html /index.csr.html; }
location ~ /[^/]+\.[^/]+$ { try_files $uri =404; }
```

For a Cloudflare-backed host, apply the same existing-file-first behavior at its current origin/edge. Do not install a blanket `/learn/*` rewrite that replaces existing prerendered article pages.

If the provider confirms that the existing project uses **Cloudflare Pages Functions**, this is an optional `functions/_middleware.js` adapter for their existing deployment process. It is a handoff example, not an enabled service or a verified account configuration:

```js
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const response = await context.next();
  const dynamic = /^\/(?:campaigns|programs|sessions|updates)\/[^\/.]+\/?$/u;
  if (
    !['GET', 'HEAD'].includes(context.request.method) ||
    response.status !== 404 ||
    !dynamic.test(url.pathname)
  )
    return response;
  url.pathname = '/index.csr'; // Pages' pretty path for index.csr.html
  url.search = '';
  const shell = await context.env.ASSETS.fetch(url);
  if (!shell.ok) return response;
  const headers = new Headers(shell.headers);
  headers.set('Cache-Control', 'no-store');
  return new Response(context.request.method === 'HEAD' ? null : shell.body, {
    status: 200,
    headers,
  });
}
```

The Pages artifact must contain a top-level `404.html` so automatic SPA handling does not return the prerendered home page for unknown URLs. Sukkar already creates one. For Alma, the provider can copy `index.csr.html` to `404.html` in the deployment artifact. Existing files must still be served before fallback. Integrate middleware with any current Functions/routing rules and confirm account limits/costs before enabling Functions. No Function, hosting setting or DNS record has been enabled by this work. See the [Cloudflare Pages API reference](https://developers.cloudflare.com/pages/functions/api-reference/) for asset and middleware behavior.

Permit `https://velobase.space` in any existing `connect-src` policy, plus approved media hosts in `img-src`/`media-src`. Do not permit credentials on these anonymous content requests. VeloBase responses send `Cache-Control: no-store` and CDN equivalents; any existing proxy must honor them. Invalidate the provider's old HTML/JavaScript cache for the one-time frontend release. Subsequent content updates require no rebuild.

## Static hosting limits and live acceptance

Runtime content updates are visible to JavaScript-capable visitors without rebuilding. Existing prerendered HTML and the build-generated sitemap are still static. New/withdrawn URLs cannot acquire reliable server-rendered HTML, HTTP 404/410 statuses, fresh social previews or sitemap entries from a browser-only change. A provider-owned server/edge rendering/revalidation plan is required if those SEO properties must also update immediately. Client-side metadata refresh and noindex on absent content are implemented; do not claim that this updates crawler caches or removes old build artifacts.

Before approving a migration, the provider must verify on https://alma-alrouh.com: direct navigation to a newly published synthetic slug, list/detail/media/language rendering, update in an already-open tab, withdrawal with no legacy fallback, refresh/reopen, ETag preflight and mobile behavior. Keep existing records unpublished during current engineering verification. The local full-chain publication test runs against the isolated VeloBase database, not hosted records.

Read-only website smoke:

```text
npm run test:browser
```

The smoke uses the actual live Railway API and requires its current documented response contract. It creates no content. Detailed synthetic publication tests live in VeloBase's `tests/content-websites` suite and require the actual website directories via `ALMA_DIR` and `SUKKAR_WEBSITE_DIR`.

## Authoring map

- `campaign`: campaigns/home/previews, `/campaigns/slug`; category `outreach` for community visits, `awareness` for awareness activities. Matching Arabic and English slugs are grouped as translations.
- `event`: online sessions; title, speaker, date, summary and image/gallery poster.
- `program`: program cards and `/programs/slug`.
- `page` with category `announcement` or `update`: home announcements and `/updates/slug`.
- `partner`: campaign partner list.

Primary image and ordered photo/video galleries use public HTTPS URLs and descriptions. No local campaign facts or historical records were silently imported as approved.
