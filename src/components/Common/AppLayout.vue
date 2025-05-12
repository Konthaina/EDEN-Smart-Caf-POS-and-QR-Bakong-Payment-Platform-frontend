
<template>
  <div class="min-h-screen bg-gray-100">
    <div class="flex">
      <aside class="w-64 bg-white p-4 shadow">
        <nav class="space-y-4">
          <router-link to="/dashboard">Dashboard</router-link>
        </nav>
      </aside>
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
