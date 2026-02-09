import React from 'react'

const NIDSLogo = ({ width = 120, height = 40, className = '' }) => {
  return (
    <div className={`nids-logo ${className}`} style={{ width, height, display: 'flex', alignItems: 'center' }}>
      <svg 
        width={height} 
        height={height} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: '10px' }}
      >
        {/* Base circular */}
        <circle cx="50" cy="50" r="48" fill="#f8f9fa" stroke="#e2e8f0" strokeWidth="1"/>
        
        {/* Forma principal azul escura - lado esquerdo */}
        <path 
          d="M15 20 Q12 17 15 15 L35 15 Q40 15 45 20 L45 50 L70 20 Q75 15 80 15 L85 15 Q88 17 85 20 L85 45 Q85 50 80 50 L50 50 L25 80 Q20 85 15 80 L15 20 Z" 
          fill="#1e40af"
        />
        
        {/* Forma ciano - elemento superior esquerdo */}
        <path 
          d="M15 15 L35 15 Q40 15 40 20 L40 35 Q40 40 35 40 L20 40 Q15 40 15 35 L15 15 Z" 
          fill="#06b6d4"
        />
        
        {/* Forma ciano - elemento inferior direito */}
        <path 
          d="M55 60 L80 60 Q85 60 85 65 L85 80 Q85 85 80 85 L65 85 Q60 85 60 80 L55 60 Z" 
          fill="#06b6d4"
        />
        
        {/* Elementos de conexão */}
        <path 
          d="M40 20 L45 20 L70 50 L70 55 L40 25 Z" 
          fill="#0369a1"
        />
        
        {/* Sombra sutil */}
        <circle cx="50" cy="50" r="47" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5"/>
      </svg>
      
      <span 
        style={{ 
          fontWeight: '700', 
          fontSize: '18px', 
          letterSpacing: '1px',
          color: 'inherit'
        }}
      >
        NIDS
      </span>
    </div>
  )
}

export default NIDSLogo
