import api from '@/lib/axios';

export interface SignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export const mediaApi = {
  getSignature: async (entityType: string): Promise<SignatureResponse> => {
    const res = await api.post('/media/signature', { entityType });
    return res.data;
  },

  confirmUpload: async (data: {
    publicId: string;
    url: string;
    secureUrl: string;
    entityType: string;
    entityId?: string;
    format?: string;
    width?: number;
    height?: number;
    bytes?: number;
    resourceType?: string;
  }) => {
    const res = await api.post('/media/confirm', data);
    return res.data;
  },
};
