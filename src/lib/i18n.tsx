// Locale plumbing — React port of app.vue's locale probe + data/locales.json usage.
// en is the root locale (no prefix); /es and /ar are landing pages, ar renders RTL.
import { createContext, useContext, type ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import locales from '~/data/locales.json'

export type Ui = (typeof locales.ui)['en']

const UiCtx = createContext<Ui>(locales.ui.en)

export function UiProvider({ children }: { children: ReactNode }) {
  const code = useLocaleCode()
  const ui = (locales.ui as Record<string, Ui>)[code] ?? locales.ui.en
  return <UiCtx value={ui}>{children}</UiCtx>
}

export function useUi(): Ui {
  return useContext(UiCtx)
}

export function useLocaleCode(): string {
  return useRouterState({
    select: s => {
      const seg = s.location.pathname.split('/')[1] ?? ''
      return locales.list.find(l => l.code === seg)?.code ?? 'en'
    },
  })
}

export function useIsHome(): boolean {
  return useRouterState({
    select: s => {
      const p = s.location.pathname.replace(/\/$/, '')
      return p === '' || locales.list.some(l => '/' + l.code === p)
    },
  })
}

export { locales }
