'use client'

import { useEffect, useState } from 'react'
import { Activity, Save, CheckCircle, AlertCircle, RefreshCw, Power } from 'lucide-react'

interface HeartbeatConfig {
  enabled: boolean
  intervalMinutes: number
  prompt: string
}

interface GatewayStatus {
  running: boolean
  output: string
}

export default function HeartbeatPage() {
  const [config, setConfig] = useState<HeartbeatConfig | null>(null)
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null)
  const [newInterval, setNewInterval] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [restartStatus, setRestartStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    loadConfig()
    loadGatewayStatus()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/heartbeat/config')
      const data = await response.json()
      
      if (data.config) {
        setConfig(data.config)
        setNewInterval(data.config.intervalMinutes)
      }
    } catch (error) {
      console.error('Error loading heartbeat config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGatewayStatus = async () => {
    try {
      const response = await fetch('/api/gateway/restart')
      const data = await response.json()
      
      if (data.success) {
        setGatewayStatus({ running: data.running, output: data.output })
      }
    } catch (error) {
      console.error('Error loading gateway status:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('/api/heartbeat/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes: newInterval })
      })

      if (!response.ok) throw new Error('Failed to save')

      await loadConfig()
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving heartbeat config:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestart = async () => {
    if (!confirm('Are you sure you want to restart the OpenClaw Gateway? This will briefly interrupt all sessions.')) {
      return
    }

    setIsRestarting(true)
    setRestartStatus('idle')

    try {
      const response = await fetch('/api/gateway/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual restart from Stoa dashboard' })
      })

      if (!response.ok) throw new Error('Failed to restart')

      setRestartStatus('success')
      setTimeout(() => {
        setRestartStatus('idle')
        loadGatewayStatus()
      }, 3000)
    } catch (error) {
      console.error('Error restarting gateway:', error)
      setRestartStatus('error')
      setTimeout(() => setRestartStatus('idle'), 3000)
    } finally {
      setIsRestarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted">Loading heartbeat configuration...</p>
        </div>
      </div>
    )
  }

  const hasChanges = config && newInterval !== config.intervalMinutes

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Heartbeat</h1>
        <p className="text-foreground-muted">
          Configure Marcus's periodic check-in frequency and gateway status.
        </p>
      </div>

      {/* Gateway Status & Control */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Power size={20} />
              <h2 className="text-xl font-semibold">Gateway Control</h2>
            </div>
            <p className="text-sm text-foreground-muted">
              Manage the OpenClaw Gateway service
            </p>
          </div>
          
          {gatewayStatus && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              gatewayStatus.running 
                ? 'bg-green/20 text-green' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                gatewayStatus.running ? 'bg-green animate-pulse' : 'bg-red-400'
              }`} />
              {gatewayStatus.running ? 'Running' : 'Stopped'}
            </div>
          )}
        </div>

        <button
          onClick={handleRestart}
          disabled={isRestarting}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
            transition-all
            ${
              isRestarting
                ? 'bg-surface-elevated text-foreground-muted cursor-not-allowed'
                : restartStatus === 'success'
                ? 'bg-green/20 text-green'
                : restartStatus === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white text-black hover:bg-accent-hover'
            }
          `}
        >
          {isRestarting ? (
            <>
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Restarting...
            </>
          ) : restartStatus === 'success' ? (
            <>
              <CheckCircle size={16} />
              Restarted Successfully
            </>
          ) : restartStatus === 'error' ? (
            <>
              <AlertCircle size={16} />
              Restart Failed
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Restart Gateway
            </>
          )}
        </button>

        <div className="mt-4 p-4 bg-surface-elevated border border-border rounded text-xs font-mono text-foreground-muted overflow-x-auto">
          {gatewayStatus?.output || 'No status information available'}
        </div>
      </div>

      {/* Heartbeat Frequency Control */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} />
              <h2 className="text-xl font-semibold">Heartbeat Frequency</h2>
            </div>
            <p className="text-sm text-foreground-muted">
              How often Marcus checks in for proactive tasks
            </p>
          </div>

          {config && (
            <div className="text-right">
              <div className="text-2xl font-semibold">
                {config.intervalMinutes}
                <span className="text-sm text-foreground-muted ml-1">min</span>
              </div>
              <div className="text-xs text-foreground-muted">Current</div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Interval (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="240"
                step="5"
                value={newInterval}
                onChange={(e) => setNewInterval(parseInt(e.target.value))}
                className="flex-1 h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="5"
                max="240"
                value={newInterval}
                onChange={(e) => setNewInterval(parseInt(e.target.value))}
                className="w-20 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-foreground-muted">
              <span>5 min (active)</span>
              <span>240 min (quiet)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 60, 120].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setNewInterval(minutes)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    newInterval === minutes
                      ? 'bg-white text-black'
                      : 'bg-surface-elevated text-foreground-muted hover:text-foreground hover:bg-surface'
                  }
                `}
              >
                {minutes}m
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
              transition-all
              ${
                isSaving || !hasChanges
                  ? 'bg-surface-elevated text-foreground-muted cursor-not-allowed'
                  : saveStatus === 'success'
                  ? 'bg-green/20 text-green'
                  : saveStatus === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white text-black hover:bg-accent-hover'
              }
            `}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle size={16} />
                Saved Successfully
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle size={16} />
                Save Failed
              </>
            ) : (
              <>
                <Save size={16} />
                {hasChanges ? 'Save Changes' : 'No Changes'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Heartbeat Prompt */}
      {config && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium mb-3">Current Heartbeat Prompt</h3>
          <pre className="text-xs text-foreground-muted bg-surface-elevated p-4 rounded border border-border overflow-x-auto whitespace-pre-wrap">
            {config.prompt}
          </pre>
          <p className="text-xs text-foreground-muted mt-3">
            This prompt is sent to Marcus at each heartbeat interval. Edit HEARTBEAT.md in your workspace to customize behavior.
          </p>
        </div>
      )}
    </div>
  )
}
