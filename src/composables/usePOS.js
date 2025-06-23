import axios from 'axios'

/**
 * ✅ Validate a promo code (discount)
 * @param {string} code
 * @returns {Promise}
 */
export async function applyPromoCode(code) {
  return await axios.post('/api/discounts/validate', { code })
}

/**
 * ✅ Create an order
 * @param {object} payload
 * @returns {Promise}
 */
export async function createOrder(payload) {
  return await axios.post('/api/orders', payload)
}
