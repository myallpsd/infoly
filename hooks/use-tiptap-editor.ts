"use client"

import type { Editor } from "@tiptap/react"
import { useCurrentEditor, useEditorState } from "@tiptap/react"
import { useEffect, useState } from "react"

type PagesStorage = {
  activeEditor?: Editor | null
}

function getActivePageEditor(editor: Editor): Editor | null {
  const storageRecord = editor.storage as unknown as Record<string, unknown>
  const pagesStorage = storageRecord["pages"] as PagesStorage | undefined
  if (!pagesStorage || typeof pagesStorage !== "object") return null
  return pagesStorage.activeEditor ?? null
}

export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null
  editorState?: Editor["state"]
  canCommand?: Editor["can"]
} {
  const { editor: coreEditor } = useCurrentEditor()
  const mainEditor = providedEditor ?? coreEditor

  const [storageEditor, setStorageEditor] = useState<Editor | null>(null)

  useEffect(() => {
    if (!mainEditor) {
      setStorageEditor(null)
      return
    }

    const updateHandler = () =>
      setStorageEditor(getActivePageEditor(mainEditor))

    updateHandler()

    mainEditor.on("update", updateHandler)
    mainEditor.on("selectionUpdate", updateHandler)

    return () => {
      mainEditor.off("update", updateHandler)
      mainEditor.off("selectionUpdate", updateHandler)
    }
  }, [mainEditor])

  useEffect(() => {
    if (!storageEditor) return

    const handleDestroy = () => setStorageEditor(null)

    storageEditor.on("destroy", handleDestroy)
    return () => {
      storageEditor.off("destroy", handleDestroy)
    }
  }, [storageEditor])

  const editorState = useEditorState({
    editor: storageEditor ?? mainEditor,
    selector(context) {
      if (!context.editor) {
        return { editor: null, editorState: undefined, canCommand: undefined }
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      }
    },
  })

  return editorState ?? { editor: null }
}
