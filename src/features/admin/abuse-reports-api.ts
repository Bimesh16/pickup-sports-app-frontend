import { api } from '@/src/api/client';

export type AbuseReport = {
  id: number;
  reportedUserId: number;
  reportedByUserId: number;
  reason: string;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
};

export type CreateAbuseReportInput = {
  reportedUserId: number;
  reason: string;
  description?: string;
};

/**
 * Get abuse reports (Admin only) - matches your backend endpoint
 * GET /abuse-reports
 */
export async function getAbuseReports(): Promise<AbuseReport[]> {
  const { data } = await api.get('/abuse-reports', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/**
 * Create abuse report
 * POST /abuse-reports
 */
export async function createAbuseReport(input: CreateAbuseReportInput): Promise<AbuseReport> {
  const { data } = await api.post('/abuse-reports', input, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/**
 * Update abuse report status (Admin only)
 * PUT /abuse-reports/{id}
 */
export async function updateAbuseReportStatus(
  id: number, 
  status: 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
): Promise<AbuseReport> {
  const { data } = await api.put(`/abuse-reports/${id}`, { status }, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}
