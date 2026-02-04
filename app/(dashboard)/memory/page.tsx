import MemoryBrowser from './MemoryBrowser'

export default function MemoryPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Memory</h1>
        <p className="text-foreground-muted">
          Browse memory files, search logs, and explore daily records.
        </p>
      </div>
      
      <MemoryBrowser />
    </div>
  )
}
