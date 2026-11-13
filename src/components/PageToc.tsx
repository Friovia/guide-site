// In-page table of contents for long "monolith" pages: reads main h2 headings
// at runtime and renders anchor chips. Ported from PageToc.vue — one line
// (<PageToc />) below the intro of any dense page.
import { useEffect, useState } from 'react'

export function PageToc() {
  const [heads, setHeads] = useState<{ id: string, text: string }[]>([])

  useEffect(() => {
    setHeads([...document.querySelectorAll('main h2')].map(h => {
      if (!h.id) {
        h.id = (h.textContent ?? '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }
      return { id: h.id, text: (h.textContent ?? '').trim() }
    }))
  }, [])

  if (heads.length <= 2) return null

  return (
    <nav className="ptoc" aria-label="On this page">
      <span className="ptoc-label">On this page</span>
      {heads.map(h => <a key={h.id} href={`#${h.id}`}>{h.text}</a>)}
    </nav>
  )
}
