import type { AppLocale } from '~/locales/messages'
import { messages } from '~/locales/messages'

function interpolate(template: string, params: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''))
}

export function useLocale() {
  const localeCookie = useCookie<AppLocale>('kanzon_locale', {
    default: () => 'en',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })

  const locale = useState<AppLocale>('kanzon-locale', () => localeCookie.value || 'en')

  const setLocale = (value: AppLocale) => {
    locale.value = value
  }

  const t = (key: string, params: Record<string, string | number> = {}) => {
    const activeMessages = messages[locale.value] ?? messages.en
    const fallbackMessages = messages.en
    const resolved = activeMessages[key] ?? fallbackMessages[key]

    if (!resolved) return key
    if (typeof resolved === 'function') return resolved(params)
    return interpolate(resolved, params)
  }

  watch(locale, (value) => {
    localeCookie.value = value

    if (import.meta.client) {
      document.documentElement.lang = value === 'id' ? 'id-ID' : 'en'
    }
  }, { immediate: true })

  return {
    locale,
    setLocale,
    t,
  }
}
