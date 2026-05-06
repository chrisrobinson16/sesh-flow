import { useCallback, useEffect, useState } from 'react'
import { Download, Share, Smartphone, X } from 'lucide-react'

const IOS_DISMISS_KEY = 'sesh_pwa_ios_install_dismissed'

function isStandalonePWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    /** @type {any} */ (window.navigator).standalone === true
  )
}

/** iPhone / iPad Safari (not in-app Chrome/Firefox UI). */
function isIOSSafariForInstall() {
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (!isIOS) return false
  if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) return false
  return true
}

export default function PWAInstallPrompt() {
  const [showIOSBanner, setShowIOSBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installModalOpen, setInstallModalOpen] = useState(false)

  useEffect(() => {
    if (isStandalonePWA()) return
    try {
      if (localStorage.getItem(IOS_DISMISS_KEY) === '1') return
    } catch {
      return
    }
    if (isIOSSafariForInstall()) {
      setShowIOSBanner(true)
    }
  }, [])

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const dismissIOS = useCallback(() => {
    try {
      localStorage.setItem(IOS_DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowIOSBanner(false)
  }, [])

  const runDeferredInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setInstallModalOpen(false)
  }, [deferredPrompt])

  return (
    <>
      {showIOSBanner ? (
        <div
          className="pwa-ios-banner"
          role="dialog"
          aria-labelledby="pwa-ios-title"
          aria-describedby="pwa-ios-desc"
        >
          <div className="pwa-ios-banner-inner">
            <div className="pwa-ios-banner-icon" aria-hidden="true">
              <Smartphone size={22} />
            </div>
            <div className="pwa-ios-banner-copy">
              <p id="pwa-ios-title" className="pwa-ios-banner-title">
                Install Sesh Tracker
              </p>
              <p id="pwa-ios-desc" className="pwa-ios-banner-text">
                Tap{' '}
                <span className="pwa-ios-inline-icon" aria-hidden="true">
                  <Share size={13} strokeWidth={2.5} />
                </span>{' '}
                Share, then &quot;Add to Home Screen&quot; for a fullscreen app experience.
              </p>
            </div>
            <button
              type="button"
              className="pwa-ios-banner-dismiss"
              onClick={dismissIOS}
              aria-label="Dismiss install hint"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

      {deferredPrompt && !isIOSSafariForInstall() ? (
        <>
          <button
            type="button"
            className="pwa-chrome-install-fab"
            onClick={() => setInstallModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={installModalOpen}
          >
            <Download size={17} aria-hidden="true" />
            Install app
          </button>
          {installModalOpen ? (
            <div
              className="pwa-install-modal-overlay"
              role="presentation"
              onClick={() => setInstallModalOpen(false)}
            >
              <div
                className="pwa-install-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pwa-install-heading"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="pwa-install-heading">Install Sesh Tracker</h2>
                <p className="pwa-install-modal-desc">
                  Add this app to your device for quick access and an app-like fullscreen
                  experience. Works offline for the shell after the first load.
                </p>
                <div className="pwa-install-modal-actions">
                  <button type="button" className="btn btn-primary" onClick={runDeferredInstall}>
                    Install
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setInstallModalOpen(false)}
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  )
}
