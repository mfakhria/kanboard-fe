import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async () => {
  // Import vue-cal styles on client side only
  await import('vue-cal/style.css')
})
