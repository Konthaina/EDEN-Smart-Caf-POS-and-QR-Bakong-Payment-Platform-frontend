import { ref } from 'vue'
import axios from 'axios'

const notificationCount = ref(0)

export function useNotificationCount() {
  // Fetch and compute the notification count
  const fetchNotificationCount = async () => {
    try {
      // Get only low stock items
      const lowStockRes = await axios.get('http://localhost:5002/ai/inventory-stockout')
      const lowStock = lowStockRes.data || []
      notificationCount.value = lowStock.length
    } catch {
      notificationCount.value = 0
    }
  }

  return {
    notificationCount,
    fetchNotificationCount,
  }
}
