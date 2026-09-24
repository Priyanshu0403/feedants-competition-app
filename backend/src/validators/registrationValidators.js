const { z } = require('zod');

const confirmPaymentSchema = z.object({
  paymentReference: z.string().trim().min(3).max(100).optional(),
});

module.exports = { confirmPaymentSchema };
