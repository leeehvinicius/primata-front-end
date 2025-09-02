'use client'

import { useState, useEffect } from 'react'

export default function DevModeIndicator() {
  const [isDevMode, setIsDevMode] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Verifica se está em modo de desenvolvimento
    const isDevelopment = process.env.NODE_ENV === 'development'
    setIsDevMode(isDevelopment)
    
    // Mostra o indicador por alguns segundos
    if (isDevelopment) {
      setShowIndicator(true)
      const timer = setTimeout(() => setShowIndicator(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isDevMode || !showIndicator) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
        🧪 Modo Desenvolvimento
      </div>
    </div>
  )
}
