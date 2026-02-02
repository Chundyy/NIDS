import React from 'react';

export default function AlertsTable({ 
  rows = [], 
  onSeverityClick = null,
  onTimestampClick = null,
  onSourceIpClick = null,
  onDestIpClick = null,
  onDescriptionClick = null,
  currentSeverityFilter = null,
  currentTimestampFilter = null,
  currentSourceIpFilter = null,
  currentDestIpFilter = null,
  currentDescriptionFilter = null
}) {
  // Depuração: Ver no console do browser o que está a chegar efetivamente
  console.log("Conteúdo de 'rows' recebido na AlertsTable:", rows);

  // Garantia: Se 'rows' não for um array (ex: se vier um objeto da API), 
  // tentamos extrair a lista ou usamos um array vazio para não quebrar o .map()
  const data = Array.isArray(rows) ? rows : (rows.alerts || rows.data || []);

  const handleSeverityClick = (severity) => {
    if (onSeverityClick) {
      onSeverityClick(currentSeverityFilter === severity ? "" : severity);
    }
  }

  const handleTimestampClick = (timestamp) => {
    if (onTimestampClick) {
      onTimestampClick(currentTimestampFilter === timestamp ? "" : timestamp);
    }
  }

  const handleSourceIpClick = (ip) => {
    if (onSourceIpClick) {
      onSourceIpClick(currentSourceIpFilter === ip ? "" : ip);
    }
  }

  const handleDestIpClick = (ip) => {
    if (onDestIpClick) {
      onDestIpClick(currentDestIpFilter === ip ? "" : ip);
    }
  }

  const handleDescriptionClick = (desc) => {
    if (onDescriptionClick) {
      onDescriptionClick(currentDescriptionFilter === desc ? "" : desc);
    }
  }

  return (
    <div className="table-wrap">
      <table className="alert-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Descrição</th>
            <th>Severidade</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((r, i) => {
              const timestamp = r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A';
              return (
                <tr key={r.id || i}>
                  <td 
                    className="mono"
                    onClick={() => handleTimestampClick(timestamp)}
                    style={{ 
                      cursor: onTimestampClick ? 'pointer' : 'default', 
                      fontWeight: currentTimestampFilter === timestamp ? 'bold' : 'normal',
                      backgroundColor: currentTimestampFilter === timestamp ? 'rgba(11,74,223,0.08)' : 'transparent'
                    }}
                  >
                    {timestamp}
                  </td>
                  <td
                    onClick={() => handleSourceIpClick(r.source_ip)}
                    style={{ 
                      cursor: onSourceIpClick ? 'pointer' : 'default',
                      fontWeight: currentSourceIpFilter === r.source_ip ? 'bold' : 'normal',
                      backgroundColor: currentSourceIpFilter === r.source_ip ? 'rgba(11,74,223,0.08)' : 'transparent'
                    }}
                  >
                    {r.source_ip || '---'}
                  </td>
                  <td
                    onClick={() => handleDestIpClick(r.destination_ip)}
                    style={{ 
                      cursor: onDestIpClick ? 'pointer' : 'default',
                      fontWeight: currentDestIpFilter === r.destination_ip ? 'bold' : 'normal',
                      backgroundColor: currentDestIpFilter === r.destination_ip ? 'rgba(11,74,223,0.08)' : 'transparent'
                    }}
                  >
                    {r.destination_ip || '---'}
                  </td>
                  <td
                    onClick={() => handleDescriptionClick(r.description)}
                    style={{ 
                      cursor: onDescriptionClick ? 'pointer' : 'default',
                      fontWeight: currentDescriptionFilter === r.description ? 'bold' : 'normal',
                      backgroundColor: currentDescriptionFilter === r.description ? 'rgba(11,74,223,0.08)' : 'transparent'
                    }}
                  >
                    {r.description || 'Sem descrição'}
                  </td>
                  <td
                    onClick={() => handleSeverityClick(r.severity)}
                    style={{ cursor: onSeverityClick ? 'pointer' : 'default' }}
                  >
                    <span 
                      className={`sev ${String(r.severity || '').toLowerCase()}`}
                      style={{ 
                        fontWeight: currentSeverityFilter === r.severity ? 'bold' : 'normal',
                        opacity: currentSeverityFilter === r.severity ? 1 : 0.8
                      }}
                    >
                      {r.severity || 'UNKNOWN'}
                    </span>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                Nenhum alerta encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
