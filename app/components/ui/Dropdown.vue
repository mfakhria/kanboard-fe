<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  open?: boolean
  align?: 'left' | 'right'
}>(), {
  open: false,
  align: 'right',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

watch(() => props.open, (v) => {
  isOpen.value = v
})

const dropdownRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const menuRef = ref<HTMLElement>()
const positioned = ref(false)
const menuStyle = ref<Record<string, string>>({
  position: 'fixed',
  visibility: 'hidden',
  top: '0',
  left: '0',
  zIndex: '9999',
})

const updatePosition = () => {
  if (!triggerRef.value) return
  const tr = triggerRef.value.getBoundingClientRect()

  // Use actual menu dimensions if rendered, otherwise estimate
  const menuW = menuRef.value?.offsetWidth || 160
  const menuH = menuRef.value?.offsetHeight || 200

  let top = tr.bottom + 8
  let left = props.align === 'right' ? tr.right - menuW : tr.left

  // Flip upward if it would overflow the viewport
  if (top + menuH > window.innerHeight - 8) {
    top = tr.top - menuH - 8
  }

  // Keep within horizontal bounds
  if (left < 8) left = 8
  if (left + menuW > window.innerWidth - 8) {
    left = window.innerWidth - menuW - 8
  }

  menuStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: '9999',
    visibility: 'visible',
  }
  positioned.value = true
}

// Position once the teleported menu is actually in the DOM
watch(menuRef, (el) => {
  if (el && isOpen.value) nextTick(updatePosition)
})

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('update:open', isOpen.value)
  if (isOpen.value) {
    // Hide menu until position is calculated to prevent sidebar flash
    positioned.value = false
    menuStyle.value = {
      position: 'fixed',
      visibility: 'hidden',
      top: '0',
      left: '0',
      zIndex: '9999',
    }
    nextTick(updatePosition)
  }
}

const close = () => {
  isOpen.value = false
  emit('update:open', false)
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (
    dropdownRef.value && !dropdownRef.value.contains(target) &&
    (!menuRef.value || !menuRef.value.contains(target))
  ) {
    close()
  }
}

const handleScroll = () => {
  if (isOpen.value) close()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})

const classes = computed(() => cn('relative inline-block', props.class))
</script>

<template>
  <div ref="dropdownRef" :class="classes">
    <div ref="triggerRef" @click="toggle">
      <slot name="trigger" />
    </div>
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="menuRef"
        :style="menuStyle"
        class="min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-opacity duration-100"
        :class="positioned ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
      >
        <slot :close="close" />
      </div>
    </Teleport>
  </div>
</template>
