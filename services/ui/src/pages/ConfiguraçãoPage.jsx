import { useState } from "react"

export default function ConfiguraçãoPage({ darkMode = false, setDarkMode = null }) {
  const [settings, setSettings] = useState({
    apiUrl: "http://localhost:8000",
    refreshInterval: 30,
    alertSound: true,
    darkMode: darkMode,
    emailNotifications: false
  })

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    // Se for darkMode, atualizar imediatamente
    if (key === 'darkMode' && setDarkMode) {
      setDarkMode(value)
    }
  }

  const handleSave = () => {
    localStorage.setItem('nids_settings', JSON.stringify(settings))
    alert('Configurações guardadas com sucesso!')
  }

  return (
    <main className="content">
      <header className="topbar">
        <div className="title">
          <h1>Configuração</h1>
          <p className="subtitle">Definições do sistema e preferências</p>
        </div>
      </header>

      <section className="settings-section">
        <div className="settings-card">
          <h3>API e Conectividade</h3>
          <div className="setting-item">
            <label>URL da API</label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={e => handleChange('apiUrl', e.target.value)}
              className="setting-input"
            />
          </div>
          <div className="setting-item">
            <label>Intervalo de atualização (segundos)</label>
            <input
              type="number"
              min="5"
              max="300"
              value={settings.refreshInterval}
              onChange={e => handleChange('refreshInterval', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>
        </div>

        <div className="settings-card">
          <h3>Notificações</h3>
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.alertSound}
                onChange={e => handleChange('alertSound', e.target.checked)}
              />
              Som de alerta para novos alertas
            </label>
          </div>
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={e => handleChange('emailNotifications', e.target.checked)}
              />
              Notificações por email
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h3>Interface</h3>
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={e => handleChange('darkMode', e.target.checked)}
              />
              Modo escuro
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSave}>Guardar Configurações</button>
          <button className="btn-secondary" onClick={() => {
            const defaults = {
              apiUrl: "http://localhost:8000",
              refreshInterval: 30,
              alertSound: true,
              darkMode: false,
              emailNotifications: false
            }
            setSettings(defaults)
            if (setDarkMode) setDarkMode(false)
          }}>Repor Padrões</button>
        </div>

        <div className="system-info">
          <h3>Informações do Sistema</h3>
          <div className="info-item">
            <span className="label">Versão</span>
            <span className="value">1.0.0</span>
          </div>
          <div className="info-item">
            <span className="label">Ambiente</span>
            <span className="value">Produção</span>
          </div>
          <div className="info-item">
            <span className="label">Base de dados</span>
            <span className="value">Elasticsearch 8.14.3</span>
          </div>
          <div className="info-item">
            <span className="label">Estado da API</span>
            <span className="value status-ok">Online</span>
          </div>
        </div>
      </section>
    </main>
  )
}
