import { buildTestApp } from './utils/buildApps';

test('GET /health is OK', async () => {
  const app = await buildTestApp();
  const res = await app.inject({ method: 'GET', url: '/health' });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  expect(body.status).toBe('ok');
  await app.close();
});
