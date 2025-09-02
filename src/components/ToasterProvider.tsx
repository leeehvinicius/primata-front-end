'use client'

import { Toaster } from 'react-hot-toast'

export default function ToasterProvider() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0d1726',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        success: {
          style: {
            background: '#065f46',
            border: '1px solid #10b981',
          },
        },
        error: {
          style: {
            background: '#7f1d1d',
            border: '1px solid #ef4444',
          },
        },
      }}
    />
  )
}
