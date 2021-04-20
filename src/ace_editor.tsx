import React, {useState, useCallback, useRef, useEffect} from 'react'
import {Ace, createEditSession} from 'ace-builds'
import AceEditor from 'react-ace'

import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-monokai'

const enumerateAnnotations: ((annotations: Ace.Annotation[]) => void) = (annotations) => {
  console.log('annotations:')
  annotations.forEach((a) => console.log(a))
}

const AceEditorPage = () => {
  const [htmlSession] = useState(createEditSession('', 'ace/mode/html'))
  const [cssSession] = useState(createEditSession('', 'ace/mode/css'))
  const [jsSession] = useState(createEditSession('', 'ace/mode/javascript'))

  const [selectState, setSelectState] = useState('html')
  const [text, setText] = useState('')
  const aceEditorEl = useRef<AceEditor>(null)

  const selectChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) =>{
    const mode = e.target.value
    switch (mode) {
      case 'html':
        aceEditorEl.current?.editor.setSession(htmlSession)
        break
      case 'css':
        aceEditorEl.current?.editor.setSession(cssSession)
        break
      case 'javascript':
        aceEditorEl.current?.editor.setSession(jsSession)
        break
    }
    setSelectState(mode)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const buttonClicked = useCallback(() => {
    const htmlErrors = htmlSession.getAnnotations()
        .filter((a) => a.type == 'error')
        .map((a) => a.row != undefined ? `${a.row +1}行目: ${a.text}` : a.text)
        .join('\n')
    const cssErroes = cssSession.getAnnotations()
        .filter((a) => a.type == 'error')
        .map((a) => a.row != undefined ? `${a.row +1}行目: ${a.text}` : a.text)
        .join('\n')
    const jsErroes = jsSession.getAnnotations()
        .filter((a) => a.type == 'error')
        .map((a) => a.row != undefined ? `${a.row +1}行目: ${a.text}` : a.text)
        .join('\n')

    setText(`Error\n- html\n${htmlErrors}\n- css\n${cssErroes}\n- javascript\n${jsErroes}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const textChanged = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setText(e.target.value), [])

  useEffect(() => {
    htmlSession.on('changeAnnotation', () => {
      const annotations = htmlSession.getAnnotations()
      enumerateAnnotations(annotations)
    })
    cssSession.on('changeAnnotation', () => {
      const annotations = cssSession.getAnnotations()
      enumerateAnnotations(annotations)
    })
    jsSession.on('changeAnnotation', () => {
      const annotations = jsSession.getAnnotations()
      enumerateAnnotations(annotations)
    })
    aceEditorEl.current?.editor.setSession(htmlSession)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <h2>
        Ace Editor
      </h2>
      <select value={selectState} onChange={selectChanged}>
        <option value='html'>HTML</option>
        <option value='css'>CSS</option>
        <option value='javascript'>JavaScript</option>
      </select>
      <AceEditor
        ref = {aceEditorEl}
        mode = 'javascript'
        theme = 'monokai'
        name = 'ace-editor-sample'
        height = '200px'
        width = '320px'
      />
      <button onClick={buttonClicked}>チェック</button>
      <br></br>
      <textarea value={text} onChange={textChanged}></textarea>
    </div>
  )
}

export default AceEditorPage
