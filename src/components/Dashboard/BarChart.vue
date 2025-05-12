
<template>
  <div class="bg-white p-4 rounded shadow">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps(['data'])
const canvas = ref(null)

onMounted(() => {
  new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: props.data.labels,
      datasets: [{
        label: 'Accepted Orders',
        data: props.data.values,
        backgroundColor: '#facc15'
      }]
    }
  })
})
</script>
