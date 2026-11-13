"use client"

import * as React from "react"

/**
 * The open modal's content element (Dialog, Sheet, Drawer, so also SettingsDialog). Base UI popups (Combobox) portal
 * into it instead of <body>, so the modal's scroll lock, focus trap, outside-press check and `pointer-events: none`
 * on <body> all treat them as inside the modal. Radix popups handle this themselves.
 */
export const PopupContainerContext = React.createContext<React.RefObject<HTMLElement | null> | undefined>(undefined)

/** For a modal's content: a ref for PopupContainerContext, composed with the caller's `ref`. */
export function usePopupContainer<T extends HTMLElement>(ref: React.Ref<T> | undefined) {
  const container = React.useRef<T | null>(null)
  const composed = React.useCallback(
    (node: T | null) => {
      container.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )
  return [container, composed] as const
}
