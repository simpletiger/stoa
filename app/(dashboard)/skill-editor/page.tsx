import SkillEditorDashboard from './SkillEditorDashboard'
import { listSkills } from '@/lib/stoa-api'

interface Skill {
  name: string
  title: string
  path: string
  description: string
}

export default async function SkillEditorPage() {
  let skills: Skill[] = []
  
  try {
    skills = await listSkills()
  } catch (error) {
    console.error('Error loading skills:', error)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Skill Editor</h1>
        <p className="text-foreground-muted">
          Create and edit custom OpenClaw skills. Changes save directly to the skills directory.
        </p>
      </div>
      
      <SkillEditorDashboard initialSkills={skills} />
    </div>
  )
}
