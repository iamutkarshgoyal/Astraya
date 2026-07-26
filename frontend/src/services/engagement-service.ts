import { api } from '@/services/api';
import type {
  ContactMessage,
  ContactMessagePayload,
  NewsletterPayload,
  NewsletterSubscriber,
} from '@/types/engagement';

export const engagementService = {
  async sendContactMessage(payload: ContactMessagePayload): Promise<ContactMessage> {
    const response = await api.post<ContactMessage>('/contact', payload);
    return response.data;
  },

  async subscribeNewsletter(payload: NewsletterPayload): Promise<NewsletterSubscriber> {
    const response = await api.post<NewsletterSubscriber>('/newsletter', payload);
    return response.data;
  },
};
