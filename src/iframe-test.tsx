import React, {useState, useCallback, useRef} from 'react'
import Styled from 'styled-components'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-monokai'

const ErrorTextArea = Styled.textarea({
  resize: 'none',
  width: '320px',
})

const decolateSrc = (src:string) => {
  // eslint-disable-next-line max-len
  return `<!DOCTYPE html><html lang="ja"><script>try{${src}}catch(error){window.ERROR_MESSAGE = error}<\/script></html>`
}

const IFrameTest = () => {
  const [editorValue, setEditorValue] = useState('')
  const [srcDoc, setSrcDoc] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const iframeEl = useRef<HTMLIFrameElement>(null)

  const editorChanged = useCallback((val: string) => setEditorValue(val), [setEditorValue])
  const buttonClicked = useCallback(() => {
    setSrcDoc(decolateSrc(editorValue))
  }, [editorValue])
  const pickErrorUp = useCallback(() => {
    const iframeWindow = iframeEl.current?.contentWindow
    if (iframeWindow) {
      if (iframeWindow.ERROR_MESSAGE) {
        setErrorMessage(iframeWindow.ERROR_MESSAGE)
      } else {
        setErrorMessage('')
      }
    }
  }, [])

  return (
    <div>
      <button onClick={buttonClicked}>実行</button>
      <AceEditor
        mode = 'javascript'
        theme = 'monokai'
        name = 'ace-editor-sample'
        height = '200px'
        width = '320px'
        value = {editorValue}
        onChange = {editorChanged}
      />
      <iframe
        ref = {iframeEl}
        srcDoc = {srcDoc}
        onLoad = {pickErrorUp}
      />
      <br/>
      <ErrorTextArea
        value = {errorMessage}
        readOnly
      />
    </div>
  )
}

export default IFrameTest
