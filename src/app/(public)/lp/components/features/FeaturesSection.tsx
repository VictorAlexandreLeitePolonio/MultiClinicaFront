'use client'

import type { ComponentType } from 'react'
import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Check } from 'lucide-react'
import { ease } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  CobrancaVisual,
  ConsultaVisual,
  EvolucaoVisual,
  type FeatureVisualProps,
  WhatsappVisual,
} from './FeatureVisuals'
import { getLpEaseOut, registerLpGsap } from './lpGsap'

interface Feature {
  id: string
  title: string
  description: string
  bullets: string[]
  Visual: ComponentType<FeatureVisualProps>
}

const FEATURES: Feature[] = [
  {
    id: 'consulta',
    title: 'Consulta gravada com relatório SOAP',
    description:
      'Grave a consulta, a IA transcreve e entrega o relatório SOAP pronto para revisar.',
    bullets: [
      'Transcrição automática',
      'SOAP revisável antes de salvar',
      'Áudio apagado após transcrever',
    ],
    Visual: ConsultaVisual,
  },
  {
    id: 'evolucao',
    title: 'Prontuário com evolução que se mede',
    description:
      'Fichas de medição viram gráfico: você vê se o paciente está melhorando.',
    bullets: [
      'Fichas de medição por sessão',
      'Gráfico de evolução automático',
      'Histórico completo do paciente',
    ],
    Visual: EvolucaoVisual,
  },
  {
    id: 'agenda',
    title: 'Agenda e copiloto no WhatsApp',
    description:
      'Pergunte ao copiloto quem você atende amanhã, direto no WhatsApp.',
    bullets: [
      'Copiloto responde no WhatsApp',
      'Agenda sincronizada em tempo real',
      'Lembretes de consulta automáticos',
    ],
    Visual: WhatsappVisual,
  },
  {
    id: 'cobranca',
    title: 'Cobrança online',
    description:
      'Envie a cobrança e receba por Pix ou cartão pelo Mercado Pago da sua clínica.',
    bullets: [
      'Pix ou cartão pelo Mercado Pago',
      'Cobrança enviada por link',
      'Baixa automática no financeiro',
    ],
    Visual: CobrancaVisual,
  },
]

function FeatureRow({
  feature,
  reversed,
}: {
  feature: Feature
  reversed: boolean
}) {
  const visualRef = useRef<HTMLDivElement>(null)
  const inView = useInView(visualRef, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() === true
  const active = inView || reduce
  const Visual = feature.Visual

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div
        className={cn('max-w-xl', reversed && 'lg:order-2 lg:justify-self-end')}
      >
        <h3 className="font-wide text-balance text-2xl leading-tight tracking-[-0.02em] text-[var(--lp-ink)] sm:text-3xl">
          {feature.title}
        </h3>
        <p className="mt-4 text-base leading-7 text-[var(--lp-muted)]">
          {feature.description}
        </p>
        <ul className="mt-6 space-y-3">
          {feature.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-3 text-sm leading-6 text-[var(--lp-ink)]"
            >
              <Check
                size={16}
                className="mt-1 shrink-0 text-[var(--color-primary)]"
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        ref={visualRef}
        className={cn('w-full', reversed && 'lg:order-1')}
        initial={false}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 8 }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.5, ease: ease.out }
        }
      >
        <Visual active={active} reduce={reduce} />
      </motion.div>
    </article>
  )
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const visualsRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const reduce = useReducedMotion() === true

  useGSAP(
    () => {
      const pin = pinRef.current
      const list = listRef.current
      const visualsWrapper = visualsRef.current
      const progress = progressRef.current

      if (!pin || !list || !visualsWrapper || !progress) return
      if (typeof window.matchMedia !== 'function') return

      registerLpGsap()

      const mm = gsap.matchMedia()

      mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          const visuals = Array.from(
            visualsWrapper.querySelectorAll<HTMLElement>(
              '[data-feature-visual]',
            ),
          )
          const total = FEATURES.length

          const timeline = gsap.timeline({
            defaults: { ease: getLpEaseOut() },
            scrollTrigger: {
              trigger: pin,
              start: 'top top',
              end: () => `+=${window.innerHeight * total}`,
              scrub: 0.5,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const next = Math.min(
                  total - 1,
                  Math.floor(self.progress * total),
                )
                setActiveIndex((current) => (current === next ? current : next))
              },
            },
          })

          timeline.fromTo(
            progress,
            { scaleX: 0 },
            { scaleX: 1, ease: 'none', duration: total },
            0,
          )

          for (let index = 1; index < total; index += 1) {
            const at = index - 0.3
            timeline.to(
              visuals[index - 1],
              { opacity: 0, y: -12, filter: 'blur(4px)', duration: 0.6 },
              at,
            )
            timeline.to(
              visuals[index],
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 },
              at,
            )
          }
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="funcionalidades"
      aria-labelledby="funcionalidades-title"
      className="relative border-t border-[var(--lp-line)] bg-[var(--lp-bg)] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2
            id="funcionalidades-title"
            className="font-wide text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-balance text-[var(--lp-ink)]"
          >
            O que a sua clínica ganha no primeiro dia
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-[var(--lp-muted)]">
            Quatro partes do dia a dia que deixam de dar trabalho manual — e
            passam a acontecer sozinhas.
          </p>
        </div>
      </div>

      {/* Desktop: funcionalidades fixas trocando com o scroll. */}
      <div ref={pinRef} className="lp-features-pinned">
        <div className="mx-auto flex h-svh w-full max-w-6xl flex-col px-6 pb-8 pt-10 sm:pt-12">
          <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
            <ol ref={listRef} className="space-y-6">
              {FEATURES.map((feature, index) => (
                <li
                  key={feature.id}
                  data-feature-item
                  data-active={index === activeIndex}
                  className="lp-feature-item"
                >
                  <span className="font-mono text-[11px] font-medium text-[var(--color-primary)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-wide mt-1.5 text-xl leading-snug tracking-[-0.02em] text-[var(--lp-ink)]">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--lp-muted)]">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ol>

            <div ref={visualsRef} className="grid min-w-0">
              {FEATURES.map((feature, index) => {
                const Visual = feature.Visual
                return (
                  <div
                    key={feature.id}
                    data-feature-visual
                    data-first={index === 0}
                    className="lp-feature-visual col-start-1 row-start-1"
                  >
                    <Visual active={index === activeIndex} reduce={reduce} />
                  </div>
                )
              })}
            </div>
          </div>

          <div
            className="mt-10 h-px w-full overflow-hidden bg-[var(--lp-line)]"
            aria-hidden="true"
          >
            <div
              ref={progressRef}
              className="lp-feature-progress h-full w-full bg-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Mobile, tablet e reduced motion: layout alternado. */}
      <div className="lp-features-flow mx-auto mt-16 max-w-6xl space-y-20 px-6 sm:mt-20 sm:space-y-28">
        {FEATURES.map((feature, index) => (
          <FeatureRow
            key={feature.id}
            feature={feature}
            reversed={index % 2 === 1}
          />
        ))}
      </div>
    </section>
  )
}
