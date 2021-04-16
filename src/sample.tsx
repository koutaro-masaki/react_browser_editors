import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react'
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
  return `${json.html}<style>${json.css}</style><script>${json.javascript}<\/script>`
}

const Sample = () => {
  const [htmlEditorValue, setHtmlEditorValue] = useState('<h1>Hello, World!</h1>')
  const [cssEditorValue, setCssEditorValue] = useState('')
  const [scriptEditorValue, setScriptEditorValue] = useState('console.log("called");')
  const [iframeSrcDoc, setIFrameSrcDoc] = useState('')
  const [selectState, setSelectState] = useState('html')
  const [workId, setWorkId] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const w = iframeRef.current?.contentWindow
    console.log('heiheihei')
    console.log(w)
    if (w) {
      w.console.log = (...data: any[]) => alert('data')
    }
  })

  const runButtonClicked = useCallback(async () => {
    if (workId == undefined) {
      const id = await fetch('http://localhost:5000/work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'html': htmlEditorValue,
          'css': cssEditorValue,
          'javascript': scriptEditorValue,
        }),
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
        setIFrameSrcDoc(makeHTMLDocument(work))
      }
    } else {
      await fetch(`http://localhost:5000/work/${workId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'html': htmlEditorValue,
          'css': cssEditorValue,
          'javascript': scriptEditorValue,
        }),
      })

      const work = await getWork(workId)
      if (work != null) {
        setIFrameSrcDoc(makeHTMLDocument(work))
      }
    }
  }, [cssEditorValue, htmlEditorValue, scriptEditorValue, workId])

  // 入力されているidでwork/{id}をGETで叩いて各editorValueに格納する
  // 実行即保存って怖いね
  const importButtonClicked = useCallback(async () => {
    // とりあえず叩く。無効な値ならalert出す
    const work = await getWork(workId)
    if (work != null) {
      setHtmlEditorValue(work.html)
      setCssEditorValue(work.css)
      setScriptEditorValue(work.javascript)
      setIFrameSrcDoc(makeHTMLDocument(work))
    } else {
      alert('取得に失敗しました. idが有効か確認してください.')
    }
  }, [workId])

  const [editorValue, setEditorValue] = useMemo(() => {
    const selectMap : SelectMap = {
      'html': [htmlEditorValue, setHtmlEditorValue],
      'css': [cssEditorValue, setCssEditorValue],
      'javascript': [scriptEditorValue, setScriptEditorValue],
    }
    return selectMap[selectState]
  }, [cssEditorValue, htmlEditorValue, scriptEditorValue, selectState])
  const editorChanged = useCallback((val: string) => setEditorValue(val), [setEditorValue])
  const selectChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectState(e.target.value), [])
  const inputChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setWorkId(e.target.value), [])

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
            mode = {selectState}
            theme = 'monokai'
            name = 'html-editor'
            height = '200px'
            width = '320px'
            value = {editorValue}
            onChange = {editorChanged}
          />
        </Box1>
        <IFrameContent>
          <IFrame srcDoc = {iframeSrcDoc} ref={iframeRef} />
        </IFrameContent>
      </GridWrapper>
    </div>
  )
}

export default Sample
