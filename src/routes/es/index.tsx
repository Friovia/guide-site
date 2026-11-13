import { createFileRoute } from '@tanstack/react-router'
import { LocaleLanding, localeHead } from '~/components/LocaleLanding'

function EsPage() {
  return <LocaleLanding locale="es" />
}

export const Route = createFileRoute('/es/')({
  head: () => localeHead('es'),
  component: EsPage,
})
