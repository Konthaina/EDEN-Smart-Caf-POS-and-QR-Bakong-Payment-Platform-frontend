import api from "@/plugins/axios";

/**
 * Validate a promo code (discount)
 * @param {string} code
 * @returns {Promise}
 */
export async function applyPromoCode(code) {
  return await api.post("/discounts/validate", { code });
}

/**
 * Create an order
 * @param {object} payload
 * @returns {Promise}
 */
export async function createOrder(payload) {
  return await api.post("/orders", payload);
}
