'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface FocusContextValue {
  focusMode: boolean
  toggleFocusMode: () => void
}

const FocusContext = createContext<FocusContextValue>({
  focusMode: false,
  toggleFocusMode: () => {},
})

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusMode] = useState(false)
  return (
    <FocusContext.Provider value={{ focusMode, toggleFocusMode: () => setFocusMode(v => !v) }}>
      {children}
    </FocusContext.Provider>
  )
}

export function useFocusMode() {
  return useContext(FocusContext)
}
