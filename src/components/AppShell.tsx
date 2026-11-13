// App shell — React port of app.vue: topbar (masthead + search + 8 channel tabs +
// language menu), channel-first sidebar (behavior of commit a5567a1: current channel
// expanded+highlighted, others toggle via managed state, search expands all, leaving
// a channel collapses it), mobile drawer, footer with data version.
import { useState, type ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import meta from '~/data/meta.json'
import nav from '~/data/nav.json'
import { useIsHome, useLocaleCode, useUi } from '~/lib/i18n'

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const isHome = useIsHome()

  return (
    <div className="shell">
      <header className="site topbar">
        <div className="inner">
          {!isHome && (
            <button className="burger" aria-label="Open navigation" onClick={() => setOpen(true)}>☰</button>
          )}
          <Link to="/" className="masthead" aria-label="Liquid Cooling Guide — home">
            <svg className="mark" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <rect x="0.75" y="0.75" width="20.5" height="20.5" rx="4" fill="none" stroke="var(--line2)" strokeWidth="1.5" />
              <path d="M5 11 h4 M13 11 h4" stroke="var(--cool)" strokeWidth="1.75" fill="none" />
              <circle cx="11" cy="11" r="2.9" fill="none" stroke="var(--cool)" strokeWidth="1.75" />
              <path d="M11 7.4 v1.2 M11 13.4 v1.2 M7.4 11 h1.2 M13.4 11 h1.2" stroke="var(--text2)" strokeWidth="1.4" />
            </svg>
            <span>Liquid Cooling Guide</span>
          </Link>

          <TopSearch />

          <nav className="topnav" aria-label="Primary">
            <ChannelTabs />
          </nav>

          <LangMenu />
        </div>
      </header>

      <div className="cols">
        {!isHome && (
          <aside className={`side${open ? ' open' : ''}`}>
            <SiteSidebar onNavigate={() => setOpen(false)} />
          </aside>
        )}
        {open && !isHome && <div className="scrim" onClick={() => setOpen(false)} />}

        <div className="content">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  )
}

function ChannelTabs() {
  const ui = useUi().nav as Record<string, string>
  const tabs: [string, string][] = [
    ['/what-is-liquid-cooling', ui.learn],
    ['/engineering', ui.engineering],
    ['/cabinet-comparison', ui.select],
    ['/site-survey', ui.operate],
    ['/supply-chain', ui.supply],
    ['/liquid-cooling-standards', ui.standards],
    ['/playground', ui.playground],
    ['/news', ui.radar],
  ]
  return <>{tabs.map(([to, label]) => <Link key={to} to={to} activeOptions={{ exact: false }}>{label}</Link>)}</>
}

// --- Channel-first sidebar (ported from SiteSidebar.vue a5567a1) ---
function SiteSidebar({ onNavigate }: { onNavigate: () => void }) {
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const pathname = useRouterState({ select: s => s.location.pathname })
  const currentSection = nav.sections.find(s => s.items.some(it => it.path === pathname))?.id

  const visible = nav.sections
    .map(s => ({ ...s, items: q ? s.items.filter(it => (it.title + ' ' + it.desc).toLowerCase().includes(q.toLowerCase())) : s.items }))
    .filter(s => s.items.length)

  const isOpen = (id: string) => !!q || id === currentSection || expanded.has(id)
  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  // Leaving a channel collapses it again
  const [prevSection, setPrevSection] = useState(currentSection)
  if (currentSection !== prevSection) {
    setPrevSection(currentSection)
    if (prevSection && expanded.has(prevSection)) {
      setExpanded(prev2 => { const n = new Set(prev2); n.delete(prevSection); return n })
    }
  }

  return (
    <nav className="sidenav" aria-label="Knowledge map">
      <div className="navsearch">
        <input value={q} onChange={e => setQ(e.target.value)} type="search" placeholder="Search the guide  ( / )" aria-label="Search the guide" />
      </div>
      {visible.map(s => (
        <div key={s.id}>
          <div
            className={`navsec${!q && s.id === currentSection ? ' chan' : ''}`}
            onClick={() => !q && toggle(s.id)}
          >
            {s.label}
            {!q && s.id !== currentSection && (
              <span className="navtoggle">{isOpen(s.id) ? '–' : '+'}</span>
            )}
          </div>
          {s.items.map(it => (
            <Link
              key={it.path}
              to={it.path}
              className={`navitem${it.path === pathname ? ' active' : ''}`}
              style={{ display: isOpen(s.id) ? undefined : 'none' }}
              onClick={onNavigate}
            >
              <span className="navtitle">{it.title}</span>
              {q && <span className="navdesc">{it.desc}</span>}
            </Link>
          ))}
        </div>
      ))}
      {!visible.length && <p className="navempty">{`No matches for “${q}.”`}</p>}
    </nav>
  )
}

// --- Topbar search (top-7 quick filter, `/` focuses) ---
function TopSearch() {
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const items = nav.sections.flatMap(s => s.items).filter(it =>
    q ? (it.title + ' ' + it.desc).toLowerCase().includes(q.toLowerCase()) : false,
  ).slice(0, 7)

  return (
    <div className="topsearch" onKeyDown={e => { if (e.key === 'Escape') setFocus(false) }}>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        type="search"
        placeholder="Search  ( / )"
        aria-label="Search the guide"
      />
      {focus && q && (
        <div className="topsearch-pop">
          {items.length === 0 && <div className="pop-item">No matches</div>}
          {items.map(it => (
            <Link key={it.path} to={it.path} className="pop-item" onMouseDown={e => e.preventDefault()}>
              <b>{it.title}</b> <span>{it.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Language menu (en root, /es /ar landings) ---
function LangMenu() {
  const [open, setOpen] = useState(false)
  const code = useLocaleCode()
  const { locales } = useUiLangs()
  return (
    <div className="langwrap" onClick={() => setOpen(o => !o)} onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <button className="langbtn" aria-label="Change language">
        {code === 'en' ? 'EN' : code.toUpperCase()} <span className="chev">▾</span>
      </button>
      {open && (
        <div className="langpop">
          {locales.map(l => (
            <Link key={l.code} to={l.code === 'en' ? '/' : `/${l.code}`} className={`langopt${l.code === code ? ' cur' : ''}`}>
              {l.native}
            </Link>
          ))}
          <a className="langopt help" href="mailto:vendors@liquidcoolingguide.com">Help us translate!</a>
        </div>
      )}
    </div>
  )
}

import { locales as localesData } from '~/lib/i18n'
function useUiLangs() { return { locales: localesData.list } }

function Footer() {
  const ui = useUi()
  const code = useLocaleCode()
  return (
    <footer className="site">
      <div className="container">
        Liquid Cooling Guide · {ui.footer}
        {code === 'en' ? (
          <span>
            {' '}Data updated as products change — see the <Link to="/changelog">changelog</Link>.
            <br />Cite this site: <i>Liquid Cooling Guide</i> — liquidcoolingguide.com, data v{meta.version}.
          </span>
        ) : (
          <span><br /><Link to="/changelog">Changelog</Link> · data v{meta.version}.</span>
        )}
      </div>
    </footer>
  )
}
