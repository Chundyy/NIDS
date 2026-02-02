const API_BASE = import.meta.env.VITE_API_BASE || 'http://192.168.207.181:8000';

export async function getAlerts({ limit = 100, severity, source_ip, destination_ip } = {}) {
  const params = new URLSearchParams()
  if (limit !== null && limit !== undefined) params.set('limit', String(limit))
  if (severity) params.set('severity', severity)
  if (source_ip) params.set('source_ip', source_ip)
  if (destination_ip) params.set('destination_ip', destination_ip)
  const res = await fetch(`${API_BASE}/alerts/?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch alerts')
  const data = await res.json()
  return Array.isArray(data) ? data : (data.alerts || []);
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/alerts/stats/`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function searchAlerts(q, limit = 100) {
  const params = new URLSearchParams({ q, limit: String(limit) })
  const res = await fetch(`${API_BASE}/alerts/search/?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to search alerts')
  return res.json()
}

// Rules API
export async function getRules() {
  const res = await fetch(`${API_BASE}/rules/`)
  if (!res.ok) throw new Error('Failed to fetch rules')
  return res.json()
}

export async function createRule(payload) {
  const res = await fetch(`${API_BASE}/rules/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create rule')
  return res.json()
}

export async function updateRule(ruleId, payload) {
  const res = await fetch(`${API_BASE}/rules/${ruleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update rule')
  return res.json()
}

export async function deleteRule(ruleId) {
  const res = await fetch(`${API_BASE}/rules/${ruleId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete rule')
  return res.json()
}
