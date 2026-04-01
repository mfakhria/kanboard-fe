<script setup lang="ts">
import {
  Search,
  ChevronDown,
  HelpCircle,
  Rocket,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Shield,
} from 'lucide-vue-next'
import type { Component } from 'vue'
const { locale } = useLocale()

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  label: string
  icon: Component
  iconColor: string
  iconBg: string
  items: FAQItem[]
}

const faqCategories = computed<FAQCategory[]>(() => locale.value === 'id' ? [
  {
    id: 'getting-started',
    label: 'Mulai',
    icon: Rocket,
    iconColor: '#478FC8',
    iconBg: '#edf4ff',
    items: [
      { id: 'gs1', question: 'Bagaimana cara membuat proyek pertama saya?', answer: 'Buka halaman Proyek dari sidebar, lalu klik tombol tambah proyek di kanan atas. Isi nama proyek, deskripsi, dan deadline. Anda juga bisa menetapkan anggota tim saat pembuatan atau menambahkannya nanti.' },
      { id: 'gs2', question: 'Apa itu board Kanban dan bagaimana cara memakainya?', answer: 'Board Kanban adalah alat manajemen proyek visual yang mengelompokkan tugas ke dalam kolom seperti "To Do", "In Progress", dan "Done". Anda bisa drag and drop tugas antar kolom untuk memperbarui statusnya. Klik kartu proyek untuk membuka detail board Kanban.' },
      { id: 'gs3', question: 'Bagaimana cara mengundang anggota tim?', answer: 'Buka halaman Tim, klik "Invite Member", masukkan email mereka, lalu pilih role yang sesuai. Setelah itu mereka akan bergabung ke tim dan proyek terkait.' },
      { id: 'gs4', question: 'Apakah saya bisa menyesuaikan layout sidebar?', answer: 'Bisa. Anda dapat mengecilkan atau membuka sidebar dengan tombol toggle di sisi panel. Preferensi ini akan diingat antar sesi dan navigasi tetap bisa diakses di kedua mode.' },
    ],
  },
  {
    id: 'projects',
    label: 'Proyek',
    icon: FolderKanban,
    iconColor: '#7c3aed',
    iconBg: '#f5f3ff',
    items: [
      { id: 'p1', question: 'Berapa banyak proyek yang bisa saya buat?', answer: 'Tidak ada batas jumlah proyek. Anda bisa membuat sebanyak yang tim Anda butuhkan. Setiap proyek dapat memiliki board Kanban, daftar tugas, dan anggota tim masing-masing.' },
      { id: 'p2', question: 'Apakah proyek bisa diarsipkan atau dihapus?', answer: 'Bisa. Buka detail proyek, klik menu tiga titik di kanan atas, lalu pilih "Archive" atau "Delete". Proyek terarsip bisa dipulihkan, sedangkan proyek yang dihapus bersifat permanen.' },
      { id: 'p3', question: 'Bagaimana cara berpindah antara tampilan kartu dan daftar?', answer: 'Di halaman Proyek ada tombol toggle tampilan dengan ikon grid dan list. Klik ikon grid untuk mode kartu atau ikon list untuk mode daftar. Preferensi tampilan Anda akan diingat.' },
      { id: 'p4', question: 'Bagaimana cara memfilter proyek berdasarkan status?', answer: 'Gunakan dropdown filter di bagian header halaman Proyek. Anda bisa memfilter status proyek dan menyortir berdasarkan beberapa kriteria seperti nama, deadline, atau progres.' },
    ],
  },
  {
    id: 'tasks',
    label: 'Tugas',
    icon: CheckSquare,
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    items: [
      { id: 't1', question: 'Bagaimana cara menugaskan task ke seseorang?', answer: 'Saat membuat atau mengedit task, klik field assignee lalu pilih anggota tim dari dropdown. Dengan begitu task akan langsung terhubung ke orang yang bertanggung jawab.' },
      { id: 't2', question: 'Apa itu prioritas task dan bagaimana cara kerjanya?', answer: 'Task bisa diberi prioritas Rendah, Sedang, Tinggi, atau Mendesak. Prioritas tinggi akan lebih mudah terlihat di UI dan membantu tim fokus pada pekerjaan yang paling penting.' },
      { id: 't3', question: 'Apakah saya bisa menetapkan deadline dan reminder?', answer: 'Bisa. Setiap task mendukung deadline. Saat deadline mendekat atau terlewat, task akan lebih mudah terlihat melalui indikator status dan notifikasi jika fitur tersebut aktif.' },
      { id: 't4', question: 'Bagaimana cara memindahkan task antar kolom Kanban?', answer: 'Cukup drag and drop kartu task dari satu kolom ke kolom lain di board Kanban. Status task akan otomatis menyesuaikan dengan kolom tujuan.' },
    ],
  },
  {
    id: 'team',
    label: 'Tim & Role',
    icon: Users,
    iconColor: '#0891b2',
    iconBg: '#ecfeff',
    items: [
      { id: 'tm1', question: 'Apa perbedaan role di dalam tim?', answer: 'Umumnya ada role seperti Owner, Admin, dan Member. Owner memiliki kendali penuh, Admin dapat mengelola anggota serta proyek, dan Member berfokus pada pekerjaan harian di dalam proyek.' },
      { id: 'tm2', question: 'Bagaimana cara mengubah role seseorang?', answer: 'Buka halaman Tim, cari anggota yang ingin diubah, lalu gunakan menu aksi pada kartu anggota tersebut. Hanya role tertentu seperti Owner atau Admin yang boleh melakukan perubahan ini.' },
      { id: 'tm3', question: 'Apakah anggota tim bisa dihapus?', answer: 'Bisa. Hapus anggota dari halaman Tim melalui menu aksi pada kartu anggota. Task yang sebelumnya dimiliki anggota tersebut akan tetap ada tetapi bisa menjadi unassigned.' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analitik & Laporan',
    icon: BarChart3,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    items: [
      { id: 'a1', question: 'Metrik apa saja yang tampil di halaman Analitik?', answer: 'Halaman Analitik menampilkan progres penyelesaian tugas, distribusi workload tim, tren task terlambat, serta ringkasan aktivitas proyek dan anggota.' },
      { id: 'a2', question: 'Apakah data analitik bisa diekspor?', answer: 'Ya, Anda bisa menggunakan tombol ekspor untuk menyiapkan data analitik ke format yang sesuai kebutuhan, tergantung fitur export yang aktif di aplikasi.' },
      { id: 'a3', question: 'Seberapa sering data analitik diperbarui?', answer: 'Data analitik diperbarui mengikuti perubahan task dan proyek, sehingga saat Anda membuka halaman ini, metrik yang tampil akan mengikuti kondisi terbaru workspace.' },
    ],
  },
  {
    id: 'account',
    label: 'Akun & Keamanan',
    icon: Shield,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    items: [
      { id: 'ac1', question: 'Bagaimana cara mengganti password?', answer: 'Buka Pengaturan lalu masuk ke tab keamanan. Isi password lama, password baru, dan konfirmasi password, kemudian simpan perubahan.' },
      { id: 'ac2', question: 'Bagaimana cara mengaktifkan Two-Factor Authentication?', answer: 'Masuk ke Pengaturan > Keamanan dan aktifkan Two-Factor Authentication jika fitur ini sudah tersedia di akun Anda, lalu ikuti instruksi yang ditampilkan.' },
      { id: 'ac3', question: 'Apakah saya bisa mengubah email atau profil?', answer: 'Bisa. Buka Pengaturan Profil untuk memperbarui nama, email, nomor telepon, bio, dan informasi profil lainnya.' },
      { id: 'ac4', question: 'Bagaimana cara menghapus tim?', answer: 'Masuk ke Pengaturan tim dan buka bagian manajemen data. Tindakan ini permanen dan hanya bisa dilakukan oleh role dengan akses tertinggi.' },
    ],
  },
] : [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Rocket,
    iconColor: '#478FC8',
    iconBg: '#edf4ff',
    items: [
      { id: 'gs1', question: 'How do I create my first project?', answer: 'Navigate to the Projects page from the sidebar, then click the "+ New Project" button in the top-right corner. Fill in the project name, description, and set a deadline. You can also assign team members during creation or add them later.' },
      { id: 'gs2', question: 'What is the Kanban board and how do I use it?', answer: 'The Kanban board is a visual project management tool that organizes tasks into columns like "To Do", "In Progress", and "Done". You can drag and drop tasks between columns to update their status. Click on any project card to open its Kanban board detail view.' },
      { id: 'gs3', question: 'How do I invite team members?', answer: 'Go to the Team page, click "Invite Member", enter their email address, and select a role (Member or Admin). They\'ll be added to your team and all its projects.' },
      { id: 'gs4', question: 'Can I customize the sidebar layout?', answer: 'Yes! You can collapse or expand the sidebar using the toggle button on its edge. The sidebar remembers your preference across sessions. All navigation items remain accessible in both states via icon-only mode with tooltips.' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    iconColor: '#7c3aed',
    iconBg: '#f5f3ff',
    items: [
      { id: 'p1', question: 'How many projects can I create?', answer: 'There is no limit on the number of projects. You can create as many projects as your team needs. Each project can have its own Kanban board, task list, and team members assigned.' },
      { id: 'p2', question: 'Can I archive or delete a project?', answer: 'Yes. Open the project detail view, click the three-dot menu in the top-right corner, and select "Archive" or "Delete". Archived projects can be restored later, but deleted projects are permanently removed after 30 days.' },
      { id: 'p3', question: 'How do I switch between card and list view?', answer: "On the Projects page, you'll find a view toggle in the header area with grid and list icons. Click the grid icon for card view or the list icon for a compact list view. Your preference is remembered." },
      { id: 'p4', question: 'How do I filter projects by status?', answer: 'Use the filter dropdown in the Projects page header. You can filter by status (All, Active, Completed, On Hold) and sort by different criteria like name, deadline, or progress.' },
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    items: [
      { id: 't1', question: 'How do I assign a task to someone?', answer: 'When creating or editing a task, click the "Assignee" field and select a team member from the dropdown. You can also assign multiple people to a single task if collaboration is needed.' },
      { id: 't2', question: 'What are task priorities and how do they work?', answer: 'Tasks can be set to Low, Medium, High, or Urgent priority. High and Urgent tasks appear with colored indicators and are surfaced in the dashboard stats. Priority helps your team focus on what matters most.' },
      { id: 't3', question: 'Can I set due dates and reminders?', answer: "Yes! Each task supports a due date. When a task is approaching its deadline, you'll see a warning indicator. Overdue tasks are highlighted in red and appear in your notifications if enabled." },
      { id: 't4', question: 'How do I move a task between Kanban columns?', answer: 'Simply drag and drop the task card from one column to another on the Kanban board. The task status will automatically update to match the column (e.g., moving to "Done" marks it complete).' },
    ],
  },
  {
    id: 'team',
    label: 'Team & Roles',
    icon: Users,
    iconColor: '#0891b2',
    iconBg: '#ecfeff',
    items: [
      { id: 'tm1', question: 'What are the different team roles?', answer: "There are three roles: Owner (full control, billing, can delete team), Admin (can manage members, projects, and settings), and Member (can create/edit tasks and view projects they're assigned to)." },
      { id: 'tm2', question: "How do I change someone's role?", answer: 'On the Team page, find the member\'s card, click the three-dot menu, and select "Edit role". Only Owners and Admins can change roles. Note: there must always be at least one Owner.' },
      { id: 'tm3', question: 'Can I remove a team member?', answer: 'Yes. Click the three-dot menu on the member\'s card and select "Remove". Their tasks will remain but become unassigned. Only Owners and Admins can remove members.' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: BarChart3,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    items: [
      { id: 'a1', question: 'What metrics does the Analytics page show?', answer: 'The Analytics page displays task completion rates, project progress over time, team workload distribution, overdue task trends, and weekly/monthly/yearly breakdowns with interactive charts.' },
      { id: 'a2', question: 'Can I export analytics data?', answer: 'Yes. On the Analytics page, click the "Export Report" button to download your data as a CSV or PDF file. You can choose the date range and which metrics to include.' },
      { id: 'a3', question: 'How often is the analytics data updated?', answer: 'Analytics data updates in real-time as tasks and projects are modified. Charts and statistics reflect the latest state of your team whenever you visit the page.' },
    ],
  },
  {
    id: 'account',
    label: 'Account & Security',
    icon: Shield,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    items: [
      { id: 'ac1', question: 'How do I change my password?', answer: 'Go to Settings > Security tab. Enter your current password, then your new password and confirmation. Click "Update Password" to save. We recommend using a strong, unique password.' },
      { id: 'ac2', question: 'How do I enable Two-Factor Authentication?', answer: "Navigate to Settings > Security and toggle on Two-Factor Authentication. You'll be prompted to scan a QR code with an authenticator app (like Google Authenticator or Authy) to complete setup." },
      { id: 'ac3', question: 'Can I change my email or profile information?', answer: 'Yes! Go to Settings > Profile tab where you can update your name, email, phone, location, website, bio, and profile picture.' },
      { id: 'ac4', question: 'How do I delete my team?', answer: 'Go to Settings > Team tab, scroll to Data Management, and click "Delete Team". This action is irreversible and will permanently remove all projects, tasks, and data. Only Owners can perform this action.' },
    ],
  },
])

const searchQuery = ref('')
const activeCategory = ref('getting-started')
const openItems = ref(new Set<string>(['gs1']))

function toggleItem(id: string) {
  const next = new Set(openItems.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openItems.value = next
}

const filteredCategories = computed(() =>
  faqCategories.value
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          !searchQuery.value ||
          item.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
    }))
    .filter(cat => cat.items.length > 0),
)

const currentCategory = computed(() =>
  searchQuery.value
    ? filteredCategories.value
    : filteredCategories.value.filter(c => c.id === activeCategory.value),
)

const totalResults = computed(() =>
  filteredCategories.value.reduce((sum, c) => sum + c.items.length, 0),
)
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" style="width: 16px; height: 16px;" />
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="locale === 'id' ? 'Cari pertanyaan yang sering diajukan...' : 'Search frequently asked questions...'"
        class="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#478FC8] focus:ring-2 focus:ring-[#478FC8]/10 shadow-sm text-[14px]"
      />
      <p
        v-if="searchQuery"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-[12px]"
      >
        {{ totalResults }} {{ locale === 'id' ? 'hasil' : `result${totalResults !== 1 ? 's' : ''}` }}
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-5">
      <!-- Category sidebar -->
      <div
        v-if="!searchQuery"
        class="flex flex-row lg:flex-col gap-1.5 lg:w-56 shrink-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0"
      >
        <button
          v-for="cat in faqCategories"
          :key="cat.id"
          class="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-200 shrink-0 relative"
          :class="activeCategory === cat.id
            ? 'bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800'
            : 'hover:bg-white/60 dark:hover:bg-gray-900/60'
          "
          @click="activeCategory = cat.id"
        >
          <!-- Active accent -->
          <div
            v-if="activeCategory === cat.id"
            class="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full hidden lg:block"
            style="width: 3px; height: 55%; background: linear-gradient(180deg, #478FC8, #5BA3D9); box-shadow: 0 0 6px rgba(71,143,200,0.4);"
          />
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            :style="{ background: cat.iconBg }"
          >
            <component :is="cat.icon" :style="{ width: '14px', height: '14px', color: cat.iconColor }" />
          </div>
          <span
            class="whitespace-nowrap text-[13px]"
            :style="{ fontWeight: activeCategory === cat.id ? 700 : 500, color: activeCategory === cat.id ? undefined : '#64748b' }"
            :class="activeCategory === cat.id ? 'text-gray-900 dark:text-white' : ''"
          >
            {{ cat.label }}
          </span>
          <span
            class="ml-auto px-1.5 py-0.5 rounded-md hidden lg:block text-[10.5px] font-bold"
            :class="activeCategory === cat.id
              ? 'bg-[#edf4ff] dark:bg-[#478FC8]/20 text-[#478FC8]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            "
          >
            {{ cat.items.length }}
          </span>
        </button>
      </div>

      <!-- FAQ list -->
      <div class="flex-1 flex flex-col gap-2.5">
        <!-- No results -->
        <div v-if="searchQuery && filteredCategories.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-800">
            <Search style="width: 24px; height: 24px; color: #cbd5e1;" />
          </div>
          <p class="text-[15px] font-bold text-gray-700 dark:text-gray-300">{{ locale === 'id' ? 'Tidak ada hasil' : 'No results found' }}</p>
          <p class="text-gray-400 dark:text-gray-500 mt-1 text-[13px]">{{ locale === 'id' ? 'Coba ubah kata kunci pencarian atau telusuri berdasarkan kategori' : 'Try adjusting your search terms or browse by category' }}</p>
        </div>

        <!-- Categories -->
        <div v-for="cat in currentCategory" :key="cat.id">
          <!-- Category label (search mode) -->
          <div v-if="searchQuery" class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" :style="{ background: cat.iconBg }">
              <component :is="cat.icon" :style="{ width: '12px', height: '12px', color: cat.iconColor }" />
            </div>
            <p class="text-[13px] font-bold text-gray-700 dark:text-gray-300">{{ cat.label }}</p>
          </div>

          <!-- Accordion items -->
          <div class="flex flex-col gap-2">
            <div
              v-for="item in cat.items"
              :key="item.id"
              class="border rounded-xl transition-all duration-200 overflow-hidden"
              :class="openItems.has(item.id)
                ? 'border-[#478FC8]/20 dark:border-[#478FC8]/30 bg-[#edf4ff]/30 dark:bg-[#478FC8]/5 shadow-sm'
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
              "
            >
              <button
                class="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                @click="toggleItem(item.id)"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                    :class="openItems.has(item.id) ? 'rotate-0' : ''"
                    :style="{ background: openItems.has(item.id) ? '#478FC8' : undefined }"
                  >
                    <div v-if="!openItems.has(item.id)" class="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <HelpCircle style="width: 12px; height: 12px; color: #94a3b8;" />
                    </div>
                    <HelpCircle v-else style="width: 12px; height: 12px; color: #fff;" />
                  </div>
                  <span
                    class="text-[13.5px]"
                    :style="{ fontWeight: openItems.has(item.id) ? 700 : 600, color: openItems.has(item.id) ? '#2d6da3' : undefined }"
                    :class="!openItems.has(item.id) ? 'text-gray-700 dark:text-gray-300' : ''"
                  >
                    {{ item.question }}
                  </span>
                </div>
                <div
                  class="shrink-0 ml-3 transition-transform duration-200"
                  :class="openItems.has(item.id) ? 'rotate-180' : ''"
                >
                  <ChevronDown :style="{ width: '14px', height: '14px', color: openItems.has(item.id) ? '#478FC8' : '#94a3b8' }" />
                </div>
              </button>

              <div v-if="openItems.has(item.id)" class="px-5 pb-4">
                <div class="pl-9">
                  <p class="text-gray-600 dark:text-gray-400 text-[13px] leading-[1.7]">
                    {{ item.answer }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
