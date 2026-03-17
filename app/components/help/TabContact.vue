<script setup lang="ts">
import {
  Mail,
  MessageSquare,
  Headphones,
  Send,
  CheckSquare,
} from 'lucide-vue-next'
import type { Component } from 'vue'

interface ContactChannel {
  icon: Component
  title: string
  desc: string
  sub: string
  color: string
  bg: string
}

const contactChannels: ContactChannel[] = [
  { icon: Mail, title: 'Email Support', desc: 'support@kanzon.app', sub: 'Response within 24 hours', color: '#478FC8', bg: '#edf4ff' },
  { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our team', sub: 'Available Mon-Fri, 9AM-6PM', color: '#16a34a', bg: '#f0fdf4' },
  { icon: Headphones, title: 'Phone Support', desc: '+62 85723847290', sub: 'Premium plan only', color: '#7c3aed', bg: '#f5f3ff' },
]

const subject = ref('')
const message = ref('')
const category = ref('general')
const sent = ref(false)

function handleSend() {
  sent.value = true
  setTimeout(() => { sent.value = false }, 3000)
  subject.value = ''
  message.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Contact channels -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="ch in contactChannels"
        :key="ch.title"
        class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="{ background: ch.bg }"
          >
            <component :is="ch.icon" :style="{ width: '16px', height: '16px', color: ch.color }" />
          </div>
          <div>
            <p class="text-[13.5px] font-bold text-gray-900 dark:text-white">{{ ch.title }}</p>
            <p class="text-gray-600 dark:text-gray-400 mt-0.5 text-[12.5px] font-medium">{{ ch.desc }}</p>
            <p class="text-gray-400 dark:text-gray-500 mt-0.5 text-[11px]">{{ ch.sub }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact form -->
    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-50 dark:border-gray-800/50">
        <h3 class="text-[15px] font-bold text-gray-900 dark:text-white">Send us a message</h3>
        <p class="mt-0.5 text-gray-400 dark:text-gray-500 text-[12.5px]">
          Describe your issue and we'll get back to you as soon as possible.
        </p>
      </div>
      <div class="px-6 py-5 flex flex-col gap-4">
        <!-- Category -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Category</label>
          <select
            v-model="category"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 appearance-none text-[13.5px]"
          >
            <option value="general">General Question</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="account">Account Issue</option>
            <option value="billing">Billing</option>
          </select>
        </div>

        <!-- Subject -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Subject</label>
          <input
            v-model="subject"
            type="text"
            placeholder="Brief summary of your question"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 text-[13.5px]"
          />
        </div>

        <!-- Message -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Message</label>
          <textarea
            v-model="message"
            :rows="5"
            placeholder="Describe your issue in detail..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 resize-none text-[13.5px]"
          />
        </div>

        <!-- Submit -->
        <div class="flex items-center justify-end gap-3">
          <span v-if="sent" class="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[12.5px] font-semibold">
            <CheckSquare style="width: 14px; height: 14px;" />
            Message sent successfully!
          </span>
          <button
            class="px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] text-[13.5px] font-bold"
            style="background: linear-gradient(135deg, #478FC8, #3570A5); box-shadow: 0 4px 16px rgba(71,143,200,0.3);"
            @click="handleSend"
          >
            <span class="flex items-center gap-2">
              <Send style="width: 14px; height: 14px;" />
              Send Message
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
