import { Layout } from './Components/Layout'
import Canvas from './Canvas/Canvas'
import { Overlay, ToolbarItems } from './Components/Overlay'

/**
 * Root Application Component
 * 
 * Orchestrates the high-level layout and feature components.
 */
function App() {
  return (
    <Layout>
      {/* The main infinite canvas engine */}
      <Canvas />
      
      {/* UI Overlay for Title and custom controls */}
      <Overlay>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 drop-shadow-sm">
              Imagination <span className="text-blue-600">Canvas</span>
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Offline-first • Infinite Space
            </p>
          </div>
          
          <ToolbarItems />
        </div>
      </Overlay>
    </Layout>
  )
}

export default App


