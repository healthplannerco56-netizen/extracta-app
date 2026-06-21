'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Instagram, Twitter, Database } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AuthModal from './AuthModal'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4'
const FADE_OUT_LEAD = 0.55
const FADE_DURATION = 500
const ENDED_DELAY = 100

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [opacity, setOpacity] = useState(0)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()

  const opacityRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef<number>()
  const fadeOutStartedRef = useRef(false)

  const fadeTo = useCallback((target: number) => {
    targetRef.current = target
    if (rafRef.current) return

    const start = performance.now()
    const startOpacity = opacityRef.current
    const diff = target - startOpacity

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / FADE_DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      opacityRef.current = startOpacity + diff * eased
      setOpacity(opacityRef.current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        opacityRef.current = target
        setOpacity(target)
        rafRef.current = undefined
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let endedTimer: ReturnType<typeof setTimeout>

    const onPlay = () => {
      fadeOutStartedRef.current = false
      fadeTo(1)
    }

    const onTimeUpdate = () => {
      if (!video.duration || fadeOutStartedRef.current) return
      if (video.currentTime >= video.duration - FADE_OUT_LEAD) {
        fadeOutStartedRef.current = true
        fadeTo(0)
      }
    }

    const onEnded = () => {
      cancelAnimationFrame(rafRef.current!)
      rafRef.current = undefined
      opacityRef.current = 0
      setOpacity(0)
      endedTimer = setTimeout(() => {
        video.currentTime = 0
        video.play()
      }, ENDED_DELAY)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    video.play()

    return () => {
      cancelAnimationFrame(rafRef.current!)
      clearTimeout(endedTimer)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [fadeTo])

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const navLinks = ['Features', 'Pricing', 'About']

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-950">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full translate-y-[17%] object-cover"
        style={{ opacity }}
        muted
        playsInline
        preload="auto"
        src={VIDEO_SRC}
      />

      <div className="relative z-10 flex h-full flex-col">
        <nav className="flex justify-center pt-6">
          <div className="liquid-glass flex items-center gap-x-8 rounded-full px-6 py-2">
            <div className="flex items-center gap-x-2 text-white">
              <Database size={18} />
              <span className="font-serif text-lg italic">Datalens</span>
            </div>

            {navLinks.map((link) => {
              const href = link === 'Pricing' ? '/pricing' : '#'
              return (
                <a
                  key={link}
                  href={href}
                  className="text-sm text-white/60 transition-colors hover:text-white/90"
                >
                  {link}
                </a>
              )
            })}

            <div className="flex items-center gap-x-3 pl-2">
              <button
                onClick={() => openAuth('signin')}
                className="text-sm text-white/60 transition-colors hover:text-white/90"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="rounded-full bg-white/10 px-4 py-1 text-sm text-white transition-colors hover:bg-white/20"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        <main className="flex flex-1 flex-col items-center justify-center gap-y-8 px-4">
          <h1 className="max-w-3xl text-center font-serif text-6xl italic leading-tight text-white sm:text-7xl md:text-8xl">
            Built for the&nbsp;curious
          </h1>

          <p className="max-w-md text-center text-sm text-white/40">
            Extract structured data from research PDFs using AI. Turn papers into
            datasets.
          </p>

          <button
            onClick={() => openAuth('signup')}
            className="liquid-glass rounded-full px-8 py-3 text-sm text-white/80 transition-colors hover:text-white"
          >
            Start extracting — free
          </button>
        </main>

        <footer className="flex justify-center gap-x-4 pb-6">
          <a
            href="#"
            className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white/80"
          >
            <Instagram size={18} />
          </a>
          <a
            href="#"
            className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white/80"
          >
            <Twitter size={18} />
          </a>
          <a
            href="#"
            className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white/80"
          >
            <Globe size={18} />
          </a>
        </footer>
      </div>

      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={() =>
          setAuthMode((m) => (m === 'signin' ? 'signup' : 'signin'))
        }
      />
    </div>
  )
}
