import { useEffect, useState } from "react"
import { getRules, createRule, updateRule, deleteRule } from "../api"

const emptyRule = { name: "", category: "", severity: "MEDIUM", description: "", enabled: true }

export default function RegrasPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyRule)
  const [error, setError] = useState(null)

  const loadRules = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRules()
      setRules(data)
    } catch (e) {
      console.error(e)
      setError("Falha ao carregar regras")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  const openNew = () => {
    setEditing(null)
    setForm(emptyRule)
    setShowModal(true)
  }

  const openEdit = (rule) => {
    setEditing(rule)
    setForm({
      name: rule.name,
      category: rule.category,
      severity: rule.severity,
      description: rule.description || "",
      enabled: rule.enabled,
      last_triggered: rule.last_triggered || null,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await updateRule(editing.id, form)
      } else {
        await createRule(form)
      }
      setShowModal(false)
      await loadRules()
    } catch (e) {
      console.error(e)
      alert("Erro ao guardar regra")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Eliminar esta regra?")) return
    try {
      await deleteRule(id)
      await loadRules()
    } catch (e) {
      console.error(e)
      alert("Erro ao eliminar regra")
    }
  }

  return (
    <main className="content">
      <header className="topbar">
        <div className="title">
          <h1>Regras de Detecção</h1>
          <p className="subtitle">Regras e políticas de segurança ativas</p>
        </div>
        <div className="controls">
          <button className="btn-primary" onClick={openNew}>Nova Regra</button>
        </div>
      </header>

      <section className="rules-section">
        {error && <div className="error-msg">{error}</div>}
        <div className="table-wrap">
          <table className="alert-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Severidade</th>
                <th>Status</th>
                <th>Último disparo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center' }}>A carregar...</td></tr>
              ) : rules.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma regra encontrada</td></tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>{rule.category}</td>
                    <td><span className={`sev ${String(rule.severity || '').toLowerCase()}`}>{rule.severity}</span></td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: rule.enabled ? '#d1fae5' : '#f3f4f6',
                          color: rule.enabled ? '#047857' : '#6b7280'
                        }}
                      >
                        {rule.enabled ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="mono">{rule.last_triggered || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" onClick={() => openEdit(rule)}>Editar</button>
                        <button className="btn-secondary" onClick={() => handleDelete(rule.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Editar Regra' : 'Nova Regra'}</h3>
            <div className="setting-item">
              <label>Nome</label>
              <input className="setting-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="setting-item">
              <label>Categoria</label>
              <input className="setting-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="setting-item">
              <label>Severidade</label>
              <select className="setting-input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Descrição</label>
              <textarea className="setting-input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="setting-item checkbox-label">
              <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
              Ativo
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button className="btn-primary" onClick={handleSave}>{editing ? 'Guardar' : 'Criar'}</button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
