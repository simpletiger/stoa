import SecurityChecklist from './SecurityChecklist'

export default function SecurityPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Security Hardening</h1>
        <p className="text-foreground-muted">
          Follow this checklist to secure your OpenClaw Mac mini setup.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-surface-elevated border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm font-medium mb-1">Interactive Security Checklist</p>
            <p className="text-xs text-foreground-muted">
              Track your security hardening progress. Items are grouped by priority. 
              Your progress is automatically saved as you check off tasks.
            </p>
          </div>
        </div>
      </div>
      
      <SecurityChecklist />
    </div>
  )
}
