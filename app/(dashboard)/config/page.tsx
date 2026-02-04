import ConfigEditor from './ConfigEditor'

export default function ConfigPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Config</h1>
        <p className="text-foreground-muted">
          View and edit OpenClaw configuration with real-time validation.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-surface-elevated border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-yellow-500 mt-0.5">⚠</div>
          <div>
            <p className="text-sm font-medium mb-1">Warning: Direct Configuration Editing</p>
            <p className="text-xs text-foreground-muted">
              Changes to this file affect OpenClaw's core configuration. Invalid JSON or 
              incorrect values may cause issues. A backup is recommended before making changes.
              Changes take effect on next OpenClaw restart.
            </p>
          </div>
        </div>
      </div>
      
      <ConfigEditor />
    </div>
  )
}
