import {CodeJar} from 'codejar'
import React, {useEffect, useRef} from 'react'

interface Props {
  highlight: (e: HTMLElement) => {}
  options?: { tab: string }
  code: string
  style: React.CSSProperties
  onUpdate: (code: string) => void
}

export const createCodeJarEditorRef = (props: Props) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const jar = useRef<CodeJar | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // eslint-disable-next-line new-cap
    jar.current = CodeJar(editorRef.current, props.highlight, props.options)
    jar.current.updateCode(props.code)

    jar.current.onUpdate((txt) => {
      if (!editorRef.current) return

      props.onUpdate(txt)
    })

    return () => jar.current!.destroy()
  }, [])

  useEffect(() => {
    if (!jar.current || !editorRef.current) return
    jar.current.updateCode(props.code)
  }, [props.code])

  useEffect(() => {
    if (!jar.current || !props.options) return
    jar.current.updateOptions(props.options)
  }, [props.options])

  return editorRef
}

export const ReactCodeJar: React.FC<Props> = (props) => {
  const editorRef = createCodeJarEditorRef(props)

  return <div ref={editorRef}></div>
}
