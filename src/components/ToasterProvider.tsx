"use client"
import { Toaster } from "sonner"

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            duration={4000}
            richColors
            closeButton
        />
    )
}
