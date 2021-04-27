import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react'
import {Ace, createEditSession} from 'ace-builds'
import AceEditor from 'react-ace'
import styled from 'styled-components'

import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/theme-monokai'

const GridWrapper = styled.div({
  display: 'grid',
  gridTemplateRows: '50px 200px 200px 200px',
  gridTemplateColumns: '320px 1fr',
  gridGap: '10px',
  gridAutoFlow: 'column',
})

const Button = styled.button({
  gridColumn: 2,
  gridRow: 1,
  justifySelf: 'left',
  alignSelf: 'end',
  width: 80,
  height: 40,
})

const Box1 = styled.div({
  gridColumn: '1',
  gridRow: '2',
})

const IFrameContent = styled.div({
  position: 'relative',
  gridColumn: '2',
  gridRow: '2/5',
})
const IFrame = styled.iframe({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
})

interface SelectMap {
  [key: string] : [string, React.Dispatch<React.SetStateAction<string>>]
}
interface PostResponceJson {
  id: string
}
interface Work {
  html: string,
  css: string,
  javascript: string
}

const getWork: ((id: string) => Promise<Work|void>) = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/work/${id}`, {method: 'GET'})
    if (!response.ok) {
      throw new Error()
    }
    return await response.json()
  } catch (error) {
    return console.error(error)
  }
}

const makeHTMLDocument: ((json: Work) => string) = (json) => {
  // eslint-disable-next-line max-len
  return `${json.html}<style>${json.css}</style><script>try{${json.javascript}}catch(error){window.ERROR_MESSAGE = error}<\/script>`
}

const Sample = () => {
  const htmlSession = useMemo(() => createEditSession('<!DOCTYPE html>\n<h1>Hello, World!</h1>', 'ace/mode/html'), [])
  const cssSession = useMemo(() => createEditSession('', 'ace/mode/css'), [])
  const jsSession = useMemo(() => createEditSession('', 'ace/mode/javascript'), [])
  const [iframeSrcDoc, setIFrameSrcDoc] = useState('')
  const [selectState, setSelectState] = useState('html')
  const [workId, setWorkId] = useState('')
  const iframeEl = useRef<HTMLIFrameElement>(null)
  const aceEditorEl = useRef<AceEditor>(null)

  const runButtonClicked = useCallback(async () => {
    const body = {
      'html': htmlSession.getValue(),
      'css': cssSession.getValue(),
      'javascript': jsSession.getValue(),
    }
    if (workId == '') {
      const id = await fetch('http://localhost:5000/work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
          .then(async (response) => {
            if (!response.ok) throw new Error()
            return await response.json().then((resJson: PostResponceJson) => resJson.id)
          })
          .catch((error) => {
            console.error(error)
            return undefined
          })

      if (id == undefined) return

      setWorkId(id)

      const work = await getWork(id)
      if (work != null) {
        // 構文エラーがあれば実行しない.
        if (htmlSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
          alert('HTMLに構文エラーがあります.')
          return
        } else if (cssSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
          alert('CSSに構文エラーがあります.')
          return
        } else if (jsSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
          alert('JavaScriptに構文エラーがあります.')
          return
        }
        setIFrameSrcDoc(makeHTMLDocument(work))
      }
    } else {
      await fetch(`http://localhost:5000/work/${workId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const work = await getWork(workId)
      if (work != null) {
        // 構文エラーがあれば実行しない.
        if (htmlSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
          alert('HTMLに構文エラーがあります.')
          return
        } else if (cssSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
          alert('CSSに構文エラーがあります.')
          return
        } else if (jsSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
          alert('JavaScriptに構文エラーがあります.')
          return
        }
        setIFrameSrcDoc(makeHTMLDocument(work))
      }
    }
  }, [cssSession, htmlSession, jsSession, workId])

  // 入力されているidでwork/{id}をGETで叩いて各editorValueに格納する
  const importButtonClicked = useCallback(async () => {
    // とりあえず叩く。無効な値ならalert出す
    const work = await getWork(workId)
    if (work != null) {
      htmlSession.setValue(work.html)
      cssSession.setValue(work.css)
      jsSession.setValue(work.javascript)
      // 構文エラーがあれば実行しない.
      if (htmlSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
        alert('HTMLに構文エラーがあります.')
        return
      } else if (cssSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
        alert('CSSに構文エラーがあります.')
        return
      } else if (jsSession.getAnnotations().filter((a) => a.type == 'error').length > 0) {
        alert('JavaScriptに構文エラーがあります.')
        return
      }
      setIFrameSrcDoc(makeHTMLDocument(work))
    } else {
      alert('取得に失敗しました. idが有効か確認してください.')
    }
  }, [cssSession, htmlSession, jsSession, workId])

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
  }, [aceEditorEl.current])
  const inputChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setWorkId(e.target.value), [])

  const pickErrorUp = useCallback(() => {
    const iframeWindow = iframeEl.current?.contentWindow
    if (iframeWindow) {
      if (iframeWindow.ERROR_MESSAGE) {
        alert(iframeWindow.ERROR_MESSAGE)
      }
    }
  }, [])
  useEffect(() => {
    aceEditorEl.current?.editor.setSession(htmlSession)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aceEditorEl.current])

  return (
    <div>
      <div>
        Work ID:
        <input type='number' min='1' value={workId} onChange={inputChanged}/>
        <button onClick={importButtonClicked}>読込</button>
      </div>
      <GridWrapper>
        <Button onClick = {runButtonClicked}>Run</Button>
        <select value={selectState} onChange={selectChanged}>
          <option value='html'>HTML</option>
          <option value='css'>CSS</option>
          <option value='javascript'>JavaScript</option>
        </select>
        <Box1>
          <AceEditor
            ref = {aceEditorEl}
            mode = 'javascript'
            theme = 'monokai'
            name = 'html-editor'
            height = '200px'
            width = '320px'
          />
        </Box1>
        <IFrameContent>
          <IFrame
            onLoad = {pickErrorUp}
            srcDoc = {iframeSrcDoc}
            ref = {iframeEl}
          />
        </IFrameContent>
      </GridWrapper>
    </div>
  )
}

export default Sample
