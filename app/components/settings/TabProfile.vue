<script setup lang="ts">
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Save,
  Upload,
  CheckCircle2,
} from 'lucide-vue-next'

const authStore = useAuthStore()

const nameParts = computed(() => {
  const full = authStore.currentUser?.name || ''
  const parts = full.trim().split(/\s+/)
  return {
    first: parts[0] || '',
    last: parts.slice(1).join(' ') || '',
  }
})

const firstName = ref(nameParts.value.first)
const lastName = ref(nameParts.value.last)
const email = ref(authStore.currentUser?.email || '')
const phone = ref('')
const location = ref('')
const website = ref('')
const bio = ref('')
const saved = ref(false)

watch(() => authStore.currentUser, (user) => {
  if (user) {
    const parts = user.name.trim().split(/\s+/)
    firstName.value = parts[0] || ''
    lastName.value = parts.slice(1).join(' ') || ''
    email.value = user.email
  }
}, { immediate: true })

const userInitials = computed(() => {
  const f = firstName.value?.[0] || ''
  const l = lastName.value?.[0] || ''
  return (f + l).toUpperCase() || '?'
})

const handleSave = () => {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Avatar -->
    <SettingsSection title="Profile Picture" description="Upload a photo to personalize your account.">
      <div class="flex items-center gap-5">
        <div class="relative group">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center text-white shrink-0"
            style="background: linear-gradient(135deg, #478FC8 0%, #5BA3D9 100%); font-size: 26px; font-weight: 800; box-shadow: 0 6px 20px rgba(71,143,200,0.3);"
          >
            {{ userInitials }}
          </div>
          <button class="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera style="width: 20px; height: 20px; color: #fff;" />
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] text-[12.5px] font-semibold"
              style="background: linear-gradient(135deg, #478FC8, #3570A5); box-shadow: 0 3px 12px rgba(71,143,200,0.3);"
            >
              <span class="flex items-center gap-1.5">
                <Upload style="width: 12px; height: 12px;" />
                Upload
              </span>
            </button>
            <button class="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-[12.5px] font-semibold">
              Remove
            </button>
          </div>
          <p class="text-gray-400 dark:text-gray-500 text-[11px]">
            JPG, PNG or SVG. Max 2MB.
          </p>
        </div>
      </div>
    </SettingsSection>

    <!-- Personal info -->
    <SettingsSection title="Personal Information" description="Update your personal details here.">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsFormField
          v-model="firstName"
          label="First Name"
          :icon="User"
          placeholder="Enter first name"
        />
        <SettingsFormField
          v-model="lastName"
          label="Last Name"
          :icon="User"
          placeholder="Enter last name"
        />
        <SettingsFormField
          v-model="email"
          label="Email Address"
          :icon="Mail"
          type="email"
          placeholder="Enter email"
        />
        <SettingsFormField
          v-model="phone"
          label="Phone Number"
          :icon="Phone"
          placeholder="Enter phone"
        />
        <SettingsFormField
          v-model="location"
          label="Location"
          :icon="MapPin"
          placeholder="Enter location"
        />
        <SettingsFormField
          v-model="website"
          label="Website"
          :icon="Globe"
          placeholder="https://..."
        />
      </div>

      <!-- Bio -->
      <div class="mt-4 flex flex-col gap-1.5">
        <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Bio</label>
        <textarea
          v-model="bio"
          :rows="3"
          placeholder="Tell us about yourself..."
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 resize-none text-[13.5px]"
        />
        <p class="text-gray-400 dark:text-gray-500 text-right text-[11px]">
          {{ bio.length }}/200 characters
        </p>
      </div>

      <!-- Save -->
      <div class="flex items-center justify-end mt-3 gap-3">
        <span v-if="saved" class="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[12.5px] font-semibold">
          <CheckCircle2 style="width: 14px; height: 14px;" />
          Changes saved!
        </span>
        <button
          class="px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] text-[13.5px] font-bold"
          style="background: linear-gradient(135deg, #478FC8, #3570A5); box-shadow: 0 4px 16px rgba(71,143,200,0.3);"
          @click="handleSave"
        >
          <span class="flex items-center gap-2">
            <Save style="width: 14px; height: 14px;" />
            Save Changes
          </span>
        </button>
      </div>
    </SettingsSection>
  </div>
</template>
