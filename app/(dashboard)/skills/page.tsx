import SkillsDashboard from './SkillsDashboard'

export default function SkillsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Skills</h1>
        <p className="text-foreground-muted">
          OpenClaw skill management and status monitoring.
        </p>
      </div>
      
      <SkillsDashboard />
    </div>
  )
}
