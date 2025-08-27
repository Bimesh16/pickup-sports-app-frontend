import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs, AuditLog } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useAuditLogs() {
  return useQuery<AuditLog[], unknown>({
    queryKey: ['admin', 'auditLogs'],
    queryFn: fetchAuditLogs,
    retry: (failureCount, error) => queryRetry(failureCount, error as any),
  });
}
