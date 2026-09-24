import client from './client';

export const getCompetition = (idOrSlug) => client.get(`/competitions/${idOrSlug}`);

export const registerForCompetition = (idOrSlug) => client.post(`/competitions/${idOrSlug}/register`);

export const confirmPayment = (registrationId, paymentReference) =>
  client.post(`/registrations/${registrationId}/confirm-payment`, { paymentReference });

export const cancelRegistration = (registrationId) => client.post(`/registrations/${registrationId}/cancel`);

export const uploadSubmission = (registrationId, formData) =>
  client.post(`/registrations/${registrationId}/submission`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
