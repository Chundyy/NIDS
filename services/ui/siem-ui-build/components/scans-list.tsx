import { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface Scan {
  id: number
  target: string
  status: string
}

const scansApi = {
  list: async () => {
    const response = await fetch("/api/scans")
    return response.json()
  },
  create: async (target: string) => {
    const response = await fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
    })
    return response.json()
  },
  delete: async (id: number) => {
    const response = await fetch(`/api/scans/${id}`, { method: "DELETE" })
    return response.json()
  },
}

export function ScansList() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState("")

  useEffect(() => {
    fetchScans()
  }, [])

  async function fetchScans() {
    setLoading(true)
    try {
      const data = await scansApi.list()
      setScans(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!target) return
    setLoading(true)
    try {
      await scansApi.create(target)
      setTarget("")
      fetchScans()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    setLoading(true)
    try {
      await scansApi.delete(id)
      fetchScans()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Scans</h2>
      <div>
        <input
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="Target IP or Host"
        />
        <Button onClick={handleCreate} disabled={loading || !target}>Create Scan</Button>
      </div>
      <ul>
        {scans.map(scan => (
          <li key={scan.id}>
            {scan.target} - {scan.status}
            <Button onClick={() => handleDelete(scan.id)} disabled={loading}>Delete</Button>
          </li>
        ))}
      </ul>
      {loading && <div>Loading...</div>}
    </div>
  )
}
