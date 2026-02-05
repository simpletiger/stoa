export type Priority = 'critical' | 'high' | 'medium' | 'lower'

export interface SecurityItem {
  id: string
  title: string
  why?: string
  steps: string[]
  code: string[]
  verification?: string
  warnings: string[]
}

export interface SecuritySection {
  priority: Priority
  title: string
  items: SecurityItem[]
}

export function parseSecurityChecklist(markdown: string): SecuritySection[] {
  const sections: SecuritySection[] = []
  const lines = markdown.split('\n')
  
  let currentSection: SecuritySection | null = null
  let currentItem: SecurityItem | null = null
  let currentCodeBlock: string[] = []
  let inCodeBlock = false
  let currentField: 'why' | 'steps' | 'verification' | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Detect priority sections (## 🔴 CRITICAL PRIORITY)
    // Also detect Implementation Order, Emergency Procedures, Security Posture Summary (skip these)
    if (trimmed.match(/^##\s+[🔴🟠🟡🟢]/) && !trimmed.includes('Implementation Order') && !trimmed.includes('Emergency Procedures') && !trimmed.includes('Security Posture')) {
      if (currentSection && currentItem) {
        currentSection.items.push(currentItem)
      }
      if (currentSection) {
        sections.push(currentSection)
      }

      const priority = detectPriority(trimmed)
      currentSection = {
        priority,
        title: trimmed.replace(/^##\s+[🔴🟠🟡🟢]\s+/, '').replace(' PRIORITY', ''),
        items: []
      }
      currentItem = null
    }
    // Detect checklist items (### ✅ 1. FileVault)
    else if (trimmed.match(/^###\s+✅/)) {
      if (currentSection && currentItem) {
        currentSection.items.push(currentItem)
      }

      const title = trimmed.replace(/^###\s+✅\s+\d+\.\s+/, '')
      const id = slugify(title)
      
      currentItem = {
        id,
        title,
        steps: [],
        code: [],
        warnings: []
      }
      currentField = null
    }
    // Code blocks
    else if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        if (currentItem && currentCodeBlock.length > 0) {
          currentItem.code.push(currentCodeBlock.join('\n'))
        }
        currentCodeBlock = []
        inCodeBlock = false
      } else {
        // Start of code block
        inCodeBlock = true
        currentCodeBlock = []
      }
    }
    else if (inCodeBlock) {
      currentCodeBlock.push(line)
    }
    // Field markers
    else if (trimmed.startsWith('**Why:**')) {
      currentField = 'why'
      const content = trimmed.replace('**Why:**', '').trim()
      if (currentItem && content) {
        currentItem.why = content
      }
    }
    else if (trimmed.startsWith('**Steps:**')) {
      currentField = 'steps'
    }
    else if (trimmed.startsWith('**Verification:**')) {
      currentField = 'verification'
    }
    else if (trimmed.startsWith('**Implementation:**')) {
      currentField = 'steps'
    }
    // Warnings
    else if (trimmed.startsWith('**⚠️')) {
      if (currentItem) {
        const warning = trimmed.replace(/^\*\*⚠️[^:]*:\*\*/, '').trim()
        if (warning) {
          currentItem.warnings.push(warning)
        }
      }
    }
    // Steps (numbered lists)
    else if (trimmed.match(/^\d+\.\s+/) && currentField === 'steps') {
      const step = trimmed.replace(/^\d+\.\s+/, '')
      if (currentItem) {
        currentItem.steps.push(step)
      }
    }
    // Continuation of fields
    else if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      if (currentField === 'why' && currentItem && trimmed) {
        currentItem.why = (currentItem.why || '') + ' ' + trimmed
      }
      else if (currentField === 'verification' && currentItem && trimmed) {
        currentItem.verification = (currentItem.verification || '') + ' ' + trimmed
      }
    }
  }

  // Push final item and section
  if (currentSection && currentItem) {
    currentSection.items.push(currentItem)
  }
  if (currentSection) {
    sections.push(currentSection)
  }

  return sections
}

function detectPriority(header: string): Priority {
  if (header.includes('🔴') || header.includes('CRITICAL')) return 'critical'
  if (header.includes('🟠') || header.includes('HIGH')) return 'high'
  if (header.includes('🟡') || header.includes('MEDIUM')) return 'medium'
  if (header.includes('🟢') || header.includes('LOWER')) return 'lower'
  return 'medium'
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
