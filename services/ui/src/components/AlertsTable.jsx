import React from 'react';

export default function AlertsTable({ rows = [] }) {
  // Depuração: Ver no console do browser o que está a chegar efetivamente
  console.log("Conteúdo de 'rows' recebido na AlertsTable:", rows);

  // Garantia: Se 'rows' não for um array (ex: se vier um objeto da API), 
  // tentamos extrair a lista ou usamos um array vazio para não quebrar o .map()
  const data = Array.isArray(rows) ? rows : (rows.alerts || rows.data || []);

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
            data.map((r, i) => (
              <tr key={r.id || i}>
                <td className="mono">
                  {/* Formata a data se possível ou mostra o raw timestamp */}
                  {r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A'}
                </td>
                <td>{r.source_ip || '---'}</td>
                <td>{r.destination_ip || '---'}</td>
                <td>{r.description || 'Sem descrição'}</td>
                <td>
                  <span className={`sev ${String(r.severity || '').toLowerCase()}`}>
                    {r.severity || 'UNKNOWN'}
                  </span>
                </td>
              </tr>
            ))
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
