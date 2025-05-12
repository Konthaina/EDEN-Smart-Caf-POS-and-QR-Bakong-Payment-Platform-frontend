
import { ref } from 'vue'
import api from '@/plugins/axios'

const summary = ref(null)
const clients = ref([])
const menus = ref([])
const chartData = ref({ labels: [], values: [] })

export default function useDashboard() {
  const loadDashboard = async () => {
    const res1 = await api.get('/reports/summary')
    const res2 = await api.get('/users')
    const res3 = await api.get('/menu-items')
    const res4 = await api.get('/reports/stats')

    summary.value = res1.data
    clients.value = res2.data.filter(u => u.role_id === 4)
    menus.value = res3.data
    chartData.value = {
      labels: res4.data.weekly.map(e => e.date),
      values: res4.data.weekly.map(e => e.revenue)
    }
  }

  return { summary, clients, menus, chartData, loadDashboard }
}
