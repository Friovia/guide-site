// Locale landing page (es/ar): same structure as the EN home — hero, live derating
// panel, radar band, feature band, then the FULL English nav index (real content
// stays English; this page localizes the chrome). Ported from LocaleLanding.vue.
import type { ReactNode } from 'react'
import { seoHead } from '~/lib/seo'
import { HeroChart } from '~/components/HeroChart'
import { LatestRadar } from '~/components/LatestRadar'
import { locales } from '~/lib/i18n'
import metaNow from '~/data/meta.json'
import nav from '~/data/nav.json'

type UiStrings = Record<string, any>

function ui(locale: string): { meta: typeof locales.list[number], s: UiStrings } {
  const meta = locales.list.find(l => l.code === locale) ?? locales.list[0]
  const s = (locales.ui as Record<string, UiStrings>)[locale] ?? (locales.ui as Record<string, UiStrings>).en
  return { meta, s }
}

export function localeHead(locale: string) {
  const { s } = ui(locale)
  return seoHead({ title: s.seoTitle, description: s.seoDesc, path: `/${locale}` })
}

export function LocaleLanding({ locale }: { locale: string }): ReactNode {
  const { meta, s } = ui(locale)

  return (
    <div dir={meta.dir}>
      <section className="home-hero">
        <p className="eyebrow">{s.eyebrow}</p>
        <h1><span className="grad">{s.heroK}</span>{s.heroRest}</h1>
        <p className="sub">{s.sub}</p>
        <div className="cta-row">
          <a href="/playground" className="btn btn-fill">{s.ctaA}</a>
          <a href="/what-is-liquid-cooling" className="btn btn-ghost">{s.ctaB}</a>
        </div>
      </section>

      <main className="container" style={{ padding:"8px 24px 60px" }}>
        <div className="heropanel">
          <HeroChart label={s.instLabel} caption={s.instCap} sub={s.instSub} />
          <div className="hp-foot">
            <span>{s.foot[0]} <b>v{metaNow.version}</b></span>
            <span>{s.foot[1]} {metaNow.datasets.products.slice(5)}</span>
            <span>{s.foot[2]} {metaNow.datasets.vendors.slice(5)}</span>
            <span>{s.foot[3]} {metaNow.datasets.formulas.slice(5)}</span>
            <span><a href="/changelog">{s.foot[4]} →</a></span>
          </div>
        </div>

        <LatestRadar label={s.radarLabel} more={s.radarMore} />

        <div className="feat-band">
          <div className="feat">
            <span className="fic">{s.feat1c}</span>
            <h3>{s.feat1k}</h3>
            <p>{s.feat1d}</p>
          </div>
          <div className="feat">
            <span className="fic">{s.feat2c}</span>
            <h3>{s.feat2k}</h3>
            <p>{s.feat2d}</p>
          </div>
          <div className="feat">
            <span className="fic">{s.feat3c}</span>
            <h3>{s.feat3k}</h3>
            <p>{s.feat3d}</p>
          </div>
        </div>

        <p className="src" style={{ margin:"40px 0 -18px" }}>{s.notice}</p>

        {nav.sections.map(sec => (
          <section key={sec.id}>
            <h2 className="idx-sec" style={{ marginTop:"56px" }}>{sec.label}</h2>
            <div className="idx">
              {sec.items.map(it => (
                <a key={it.path} href={it.path} className="idx-row">
                  <span className="idx-title">{it.title}</span>
                  <span className="idx-desc">{it.desc}</span>
                  <span className="idx-arrow">→</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
