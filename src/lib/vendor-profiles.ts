// Per-vendor profile layer: types + lookups over data/vendor-profiles.json.
// The directory (vendors.json) stays authoritative for segment membership and
// the 98-row listing; profiles only deepen rows that already exist there.
import profilesData from '~/data/vendor-profiles.json'
import vendorsData from '~/data/vendors.json'

export interface ProfileProductLine { name: string; note: string; source: string }
export interface ProfileFact { year: string; text: string; source: string }
export interface VendorProfile {
  slug: string
  name: string
  segments: string[]
  tagline: string
  /** "NOT_FOUND" in the data means researched-but-unpublished → renders as not-published, never guessed. */
  hq?: string
  founded?: number | string
  ownership?: string
  website: string
  productLines?: ProfileProductLine[]
  facts?: ProfileFact[]
  ocp?: string
  faq?: { q: string; a: string }[]
  placeholder?: boolean
}

// json import widens literals; assert through the declared shape once, here.
export const profiles = profilesData.profiles as VendorProfile[]

export const profilesUpdated: string = profilesData.updated

export function getProfile(slug: string): VendorProfile | undefined {
  return profiles.find(p => p.slug === slug)
}

/** Prerender URL truth — vite.config.ts and scripts/check-nav.mjs both derive from this list. */
export const profilePaths = profiles.map(p => `/supply-chain/${p.slug}`)

/** Directory-layer segment (label + sibling companies), or undefined for an unknown id. */
export function segmentContext(id: string) {
  const segs = vendorsData.segments as { id: string; label: string; note: string; companies: { name: string; source: string }[] }[]
  return segs.find(s => s.id === id)
}

/** Slug for a company name, if a profile page exists for it (drives the directory-table deep links). */
export function profileSlugFor(name: string): string | undefined {
  return profiles.find(p => p.name === name)?.slug
}

/** Facts-policy rendering: NOT_FOUND → "not published" red light; absent field → row hidden. */
export function factValue(v: string | number | undefined): string | null {
  if (v === undefined || v === '') return null
  if (v === 'NOT_FOUND') return 'not published'
  return String(v)
}
