import React, {useState, useCallback, useRef, useEffect} from 'react'
import {Ace} from 'ace-builds'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-monokai'

const decolateSrc = (src:string) => {
  return `<script>try{${src}}catch(error){alert(error)}<\/script>`
}

const IFrameTest = () => {
  const [editorValue, setEditorValue] = useState('')
  const [srcDoc, setSrcDoc] = useState('')

  const editorChanged = useCallback((val: string) => setEditorValue(val), [setEditorValue])
  const buttonClicked = useCallback(() => setSrcDoc(decolateSrc(editorValue)), [editorValue])

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
        srcDoc = {srcDoc}
      />
    </div>
  )
}

export default IFrameTest
