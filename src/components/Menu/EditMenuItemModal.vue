<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">✏️ Edit Menu Item</h2>
                <button @click="close" class="text-gray-400 hover:text-red-500 text-xl">×</button>
            </div>

            <form @submit.prevent="submitForm" class="space-y-4">
                <!-- Image Upload + Preview -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Image</label>
                    <input type="file" @change="handleFileChange" class="border rounded px-3 py-2 w-full" />
                    <div v-if="form.imagePreview" class="mt-2">
                        <img :src="form.imagePreview" class="h-20 rounded object-cover" />
                    </div>
                </div>

                <!-- Name -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Name</label>
                    <input v-model="form.name" type="text" class="border rounded px-3 py-2 w-full" required />
                </div>

                <!-- Price -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Price ($)</label>
                    <input v-model="form.price" type="number" step="0.01" class="border rounded px-3 py-2 w-full"
                        required />
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Category</label>
                    <select v-model="form.category_id" class="border rounded px-3 py-2 w-full" required>
                        <option value="">-- Select Category --</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" @click="close"
                        class="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button type="submit"
                        class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/plugins/axios'

const props = defineProps({
    show: Boolean,
    item: Object,
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
    name: '',
    price: '',
    category_id: '',
    image: null,
    imagePreview: '',
})

const categories = ref([])

watch(
    () => props.item,
    (val) => {
        if (val) {
            form.value.name = val.name
            form.value.price = val.price
            form.value.category_id = val.category_id
            form.value.imagePreview = `/storage/${val.image}`
        }
    },
    { immediate: true }
)

const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        form.value.image = file
        form.value.imagePreview = URL.createObjectURL(file)
    }
}

const close = () => emit('close')

const fetchCategories = async () => {
    const res = await api.get('/categories')
    categories.value = res.data
}

onMounted(fetchCategories)

const submitForm = async () => {
    try {
        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('price', form.value.price)
        formData.append('category_id', form.value.category_id)
        formData.append('_method', 'PUT') // Laravel expects this override

        if (form.value.image instanceof File) {
            formData.append('image', form.value.image)
        }

        await api.post(`/menu-items/${props.item.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        emit('saved')
        close()
    } catch (err) {
        console.error('❌ Edit failed:', err)
    }
}

</script>
