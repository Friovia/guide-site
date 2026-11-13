import { createFileRoute } from '@tanstack/react-router'
import { LocaleLanding, localeHead } from '~/components/LocaleLanding'

function ArPage() {
  return <LocaleLanding locale="ar" />
}

export const Route = createFileRoute('/ar/')({
  head: () => localeHead('ar'),
  component: ArPage,
})
