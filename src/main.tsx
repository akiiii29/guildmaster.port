import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { indexContent, loadGameContent } from './game/content'
import { GameStore } from './game/store'

const syncAppViewportHeight = () => {
  const height = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-viewport-height', `${Math.round(height)}px`)
}

syncAppViewportHeight()
window.addEventListener('resize', syncAppViewportHeight)
window.visualViewport?.addEventListener('resize', syncAppViewportHeight)
window.visualViewport?.addEventListener('scroll', syncAppViewportHeight)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'))
}

const root = createRoot(document.getElementById('root')!)
root.render(<div className="loading-screen"><div className="loading-rune">◇</div><strong>Opening the guild...</strong></div>)

loadGameContent()
  .then((content) => {
    const index = indexContent(content)
    const store = new GameStore(index)
    root.render(<StrictMode><ErrorBoundary><App content={content} index={index} store={store} /></ErrorBoundary></StrictMode>)
  })
  .catch((error) => {
    root.render(<div className="loading-screen error-screen"><strong>Unable to open the guild.</strong><code>{String(error)}</code></div>)
  })
