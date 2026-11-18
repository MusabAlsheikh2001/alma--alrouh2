import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { PublicContentStore } from './public-content';
let api: PublicContentStore, http: HttpTestingController;
const token = 'a'.repeat(64);
const next = () => new Promise<void>((resolve) => queueMicrotask(resolve));
function revision(kinds: string[] = [], workspace = api.workspace) {
  return {
    apiVersion: '1',
    project: { slug: workspace },
    revision: token,
    available: { content: true, menu: false },
    contentAuthority: { version: 1, kinds },
  };
}
const request = (path: string) => http.expectOne((r) => r.url.includes('/' + path));
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  api = TestBed.inject(PublicContentStore);
  http = TestBed.inject(HttpTestingController);
});
afterEach(() => {
  http.verify();
  TestBed.resetTestingModule();
});
async function empty(kinds: string[] = []) {
  const pending = api.refresh(true);
  request('revision').flush(revision(kinds));
  await next();
  request('content?').flush({
    apiVersion: '1',
    project: { slug: api.workspace },
    contentAuthority: { version: 1, kinds },
    data: [],
    total: 0,
    page: 1,
    pageSize: 50,
  });
  await next();
  request('revision').flush(revision(kinds));
  expect(await pending).toBe(true);
}
it('processes an empty published response without activating a section migration', async () => {
  await empty();
  expect(api.status()).toBe('ready');
  expect(api.documents()).toEqual([]);
  expect(api.useLegacy('article')).toBe(true);
});
it('suppresses legacy copies after migration even when the published dataset is empty', async () => {
  await empty(['article', 'campaign']);
  expect(api.useLegacy('article')).toBe(false);
  expect(api.useLegacy('campaign')).toBe(false);
});
it('fails closed on the wrong workspace and coalesces concurrent refreshes', async () => {
  const first = api.refresh();
  const second = api.refresh();
  expect(first).toBe(second);
  request('revision').flush(revision([], 'foreign-workspace'));
  expect(await first).toBe(false);
  expect(api.status()).toBe('error');
  expect(api.useLegacy('article')).toBe(false);
});
it('does not revert an observed migration policy after an invalid or stale response', async () => {
  await empty(['article']);
  const pending = api.refresh(true);
  request('revision').flush(revision([]));
  expect(await pending).toBe(false);
  expect(api.useLegacy('article')).toBe(false);
});
it('uses credential-free requests and keeps the snapshot on a 304 revision', async () => {
  await empty();
  const pending = api.refresh();
  const check = request('revision');
  expect(check.request.withCredentials).toBe(false);
  expect(check.request.credentials).toBe('omit');
  expect(check.request.headers.has('Authorization')).toBe(false);
  expect(check.request.headers.get('If-None-Match')).toBe('"' + token + '"');
  check.flush(null, { status: 304, statusText: 'Not Modified' });
  expect(await pending).toBe(true);
  expect(api.status()).toBe('ready');
});
it('clears the public snapshot on a service failure and permits retry', async () => {
  const pending = api.refresh();
  request('revision').flush({ error: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
  expect(await pending).toBe(false);
  expect(api.documents()).toEqual([]);
  await empty();
  expect(api.status()).toBe('ready');
});
