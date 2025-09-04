'use client'

import { useState, useEffect } from 'react'

export default function DevModeIndicator() {
    if (process.env.NODE_ENV !== 'development') return null

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg font-medium text-sm">
                🚀 DEV MODE
            </div>
        </div>
    )
}
