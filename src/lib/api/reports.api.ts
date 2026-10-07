import api from '@/lib/axios';

export interface SubmitReportDto {
  type: 'USER' | 'ACTIVITY' | 'MESSAGE' | 'MEDIA';
  description: string;
  targetUserId?: string;
  targetActivityId?: string;
  targetMessageId?: string;
  targetMediaId?: string;
}

export const reportsApi = {
  /** Submit a user or content report */
  submit: (dto: SubmitReportDto) =>
    api
      .post<{ id: string; message: string }>('/reports', dto)
      .then((r) => r.data),
};
