import { test, expect } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL;
const creator = {
  username: process.env.E2E_USER1,
  password: process.env.E2E_PASS1,
};
const joiner = {
  username: process.env.E2E_USER2,
  password: process.env.E2E_PASS2,
};

const apiBase = process.env.E2E_API_BASE_URL;

test.describe('invite flow', () => {
  test.skip(
    !baseURL || !apiBase || !creator.username || !creator.password || !joiner.username || !joiner.password,
    'E2E environment variables not set'
  );

  test('user can create game, generate invite link, and join via link', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();

    await page1.goto(`${baseURL}/(auth)/login`);
    await page1.getByPlaceholder('Username').fill(creator.username!);
    await page1.getByPlaceholder('Password').fill(creator.password!);
    await page1.getByRole('button', { name: /sign in/i }).click();
    await page1.getByRole('tab', { name: 'Create' }).click();

    const title = `E2E Game ${Date.now()}`;
    await page1.getByPlaceholder('Title').fill(title);
    await page1.getByPlaceholder('Location').fill('Test Field');
    const startsAt = new Date(Date.now() + 3600_000).toISOString().slice(0, 16);
    await page1.getByPlaceholder('YYYY-MM-DDTHH:mm').fill(startsAt);

    const [createResp] = await Promise.all([
      page1.waitForResponse((r) => r.url().includes('/games') && r.request().method() === 'POST'),
      page1.getByRole('button', { name: 'Create game' }).click(),
    ]);
    const created = await createResp.json();
    const gameId = created.id as string;

    await page1.goto(`${baseURL}/(tabs)/game/${gameId}`);
    const [inviteResp] = await Promise.all([
      page1.waitForResponse((r) => r.url().includes(`/games/${gameId}/invites`) && r.request().method() === 'POST'),
      page1.getByLabel('Invite players').click(),
    ]);
    const invite = await inviteResp.json();
    const inviteUrl = invite.url as string;

    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto(`${baseURL}/(auth)/login`);
    await page2.getByPlaceholder('Username').fill(joiner.username!);
    await page2.getByPlaceholder('Password').fill(joiner.password!);
    await page2.getByRole('button', { name: /sign in/i }).click();

    page2.once('dialog', (d) => d.accept());
    await page2.goto(inviteUrl);
    await page2.waitForSelector('text=Leave game');

    await page2.goto(`${baseURL}/(tabs)/my`);
    await expect(page2.getByText(title)).toBeVisible();
  });
});
