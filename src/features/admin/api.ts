import { api } from '@/src/api/client';

export type AuditLog = {
  id: string;
  action: string;
  timestamp: string;
  actor?: string;
};

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { data } = await api.get('/admin/audit-logs', { headers: { 'Cache-Control': 'no-store' } });
  if (Array.isArray(data)) return data as AuditLog[];
  return (data?.items ?? []) as AuditLog[];
}

export async function fetchProfanityWords(): Promise<string[]> {
  const { data } = await api.get('/admin/profanity', { headers: { 'Cache-Control': 'no-store' } });
  if (Array.isArray(data)) return data as string[];
  if (Array.isArray(data?.words)) return data.words as string[];
  return [];
}

export async function addProfanityWord(word: string): Promise<void> {
  await api.post('/admin/profanity', { word }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function updateProfanityWord(oldWord: string, newWord: string): Promise<void> {
  await api.put(`/admin/profanity/${encodeURIComponent(oldWord)}`, { word: newWord }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function deleteProfanityWord(word: string): Promise<void> {
  await api.delete(`/admin/profanity/${encodeURIComponent(word)}`, { headers: { 'Cache-Control': 'no-store' } });
}
