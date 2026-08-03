import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { indexContent, loadGameContent } from './game/content'
import { GameStore } from './game/store'

const root = createRoot(document.getElementById('root')!)
root.render(<div className="loading-screen"><div className="loading-rune">◇</div><strong>Opening the guild...</strong></div>)

loadGameContent()
  .then((content) => {
    const index = indexContent(content)
    const store = new GameStore(index)
    root.render(<StrictMode><App content={content} index={index} store={store} /></StrictMode>)
  })
  .catch((error) => {
    root.render(<div className="loading-screen error-screen"><strong>Unable to open the guild.</strong><code>{String(error)}</code></div>)
  })
