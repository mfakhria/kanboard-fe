<script setup lang="ts">
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  AlertTriangle,
} from 'lucide-vue-next'

const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const twoFA = ref(false)
const sessionAlerts = ref(true)

const sessions = [
  { device: 'Chrome on Windows', location: 'Jakarta, ID', time: 'Active now', current: true },
  { device: 'Safari on iPhone', location: 'Jakarta, ID', time: '2 hours ago', current: false },
  { device: 'Firefox on MacOS', location: 'Bandung, ID', time: '3 days ago', current: false },
]
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Change Password -->
    <SettingsSection title="Change Password" description="Ensure your account stays secure.">
      <div class="flex flex-col gap-4 max-w-md">
        <!-- Current password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Current Password</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Lock style="width: 14px; height: 14px;" />
            </div>
            <input
              :type="showOld ? 'text' : 'password'"
              v-model="oldPassword"
              placeholder="Enter current password"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 text-[13.5px]"
            />
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              @click="showOld = !showOld"
            >
              <EyeOff v-if="showOld" style="width: 14px; height: 14px;" />
              <Eye v-else style="width: 14px; height: 14px;" />
            </button>
          </div>
        </div>

        <!-- New password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">New Password</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Key style="width: 14px; height: 14px;" />
            </div>
            <input
              :type="showNew ? 'text' : 'password'"
              v-model="newPassword"
              placeholder="Enter new password"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 text-[13.5px]"
            />
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              @click="showNew = !showNew"
            >
              <EyeOff v-if="showNew" style="width: 14px; height: 14px;" />
              <Eye v-else style="width: 14px; height: 14px;" />
            </button>
          </div>
        </div>

        <!-- Confirm password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Confirm New Password</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Key style="width: 14px; height: 14px;" />
            </div>
            <input
              :type="showConfirm ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Confirm new password"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 text-[13.5px]"
            />
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              @click="showConfirm = !showConfirm"
            >
              <EyeOff v-if="showConfirm" style="width: 14px; height: 14px;" />
              <Eye v-else style="width: 14px; height: 14px;" />
            </button>
          </div>
        </div>

        <button
          class="self-start px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] mt-1 text-[13.5px] font-bold"
          style="background: linear-gradient(135deg, #478FC8, #3570A5); box-shadow: 0 4px 16px rgba(71,143,200,0.3);"
        >
          Update Password
        </button>
      </div>
    </SettingsSection>

    <!-- 2FA -->
    <SettingsSection title="Two-Factor Authentication" description="Add an extra layer of security.">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="{ background: twoFA ? '#f0fdf4' : '#f8fafc' }"
          >
            <Smartphone :style="{ width: '16px', height: '16px', color: twoFA ? '#16a34a' : '#94a3b8' }" />
          </div>
          <div>
            <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">
              {{ twoFA ? '2FA Enabled' : '2FA Disabled' }}
            </p>
            <p class="text-gray-400 dark:text-gray-500 text-[12px]">
              {{ twoFA ? 'Your account is protected with 2FA' : 'Enable to secure your account with an authenticator app' }}
            </p>
          </div>
        </div>
        <SettingsToggle :enabled="twoFA" @toggle="twoFA = !twoFA" />
      </div>
    </SettingsSection>

    <!-- Active Sessions -->
    <SettingsSection title="Active Sessions" description="Manage your active sessions across devices.">
      <div class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
        <div v-for="(s, i) in sessions" :key="i" class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :style="{ background: s.current ? '#edf4ff' : '#f8fafc' }"
            >
              <Monitor :style="{ width: '14px', height: '14px', color: s.current ? '#478FC8' : '#94a3b8' }" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">
                  {{ s.device }}
                </p>
                <span
                  v-if="s.current"
                  class="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 text-[10px] font-bold"
                >
                  Current
                </span>
              </div>
              <p class="text-gray-400 dark:text-gray-500 text-[12px]">
                {{ s.location }} · {{ s.time }}
              </p>
            </div>
          </div>
          <button
            v-if="!s.current"
            class="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-[12px] font-semibold"
          >
            Revoke
          </button>
        </div>
      </div>

      <!-- Session alerts -->
      <div class="flex items-center justify-between pt-4 mt-2 border-t border-gray-50 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background: #fff7ed;">
            <AlertTriangle style="width: 15px; height: 15px; color: #ea580c;" />
          </div>
          <div>
            <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">Session Login Alerts</p>
            <p class="text-gray-400 dark:text-gray-500 text-[12px]">Get notified when someone logs into your account</p>
          </div>
        </div>
        <SettingsToggle :enabled="sessionAlerts" @toggle="sessionAlerts = !sessionAlerts" />
      </div>
    </SettingsSection>
  </div>
</template>
