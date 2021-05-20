import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react'
import {createEditSession} from 'ace-builds'
import {useHistory} from 'react-router-dom'
import AceEditor from 'react-ace'
import styled from 'styled-components'

import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/theme-monokai'

const URL = 'http://localhost:5000'

const GridWrapper = styled.div({
  display: 'grid',
  gridTemplateRows: '30px 500px',
  gridTemplateColumns: '500px 500px',
  gridGap: '10px',
  gridAutoFlow: 'column',
})

const Button = styled.button({
  gridColumn: 2,
  gridRow: 1,
  justifySelf: 'left',
  alignSelf: 'end',
  width: 80,
  height: 30,
})

const Box1 = styled.div({
  gridColumn: 1,
  gridRow: 2,
})

const IFrameContent = styled.div({
  position: 'relative',
  gridColumn: 2,
  gridRow: 2,
})

interface PostResponceJson {
  id: string
}
interface Work {
  html: string,
  css: string,
  javascript: string
}

const presetSizes : {height:number, width:number}[] = [
  {height: 320, width: 320},
  {height: 480, width: 320},
  {height: 300, width: 400},
  {height: 480, width: 600},
  {height: 800, width: 800},
]

const getWork: ((id: number) => Promise<Work|undefined>) = async (id) => {
  try {
    const response = await fetch(`${URL}/work/${id}`, {method: 'GET'})
    if (!response.ok) {
      switch (response.status) {
        case 400:
          new Error(`${response.status}: パラメータが不足しています.`)
          break
        case 404:
          new Error(`${response.status}: 作品${id}が見つかりませんでした.`)
          break
        default:
          new Error(`${response.status}: ${response.statusText}`)
          break
      }
    }
    return await response.json()
  } catch (error) {
    console.log(error)
    return undefined
  }
}

const saveWork: ((work: Work, id: number | '' | undefined) => Promise<number|''>) = async (work, id) => {
  const response = id == undefined || id == '' ?
    fetch(`${URL}/work`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(work),
    }) :
        fetch(`${URL}/work/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(work),
        })

  return await response.then(async (response) => {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`)
    }
    return await response.json().then((resJson: PostResponceJson) => parseInt(resJson.id))
  })
      .catch((error) => {
        console.error(error)
        alert('保存に失敗しました')
        return ''
      })
}


const makeHTMLDocument: ((json: Work) => string) = (json) => {
  // eslint-disable-next-line max-len
  return `${json.html}<style>${json.css}</style><script>try{${json.javascript}}catch(error){window.parent.postMessage(error, 'http://localhost:3000/')}<\/script>`
}

const Sample = () => {
  const htmlSession = useMemo(() => createEditSession('<!DOCTYPE html>\n<h1>Hello, World!</h1>', 'ace/mode/html'), [])
  const cssSession = useMemo(() => createEditSession('', 'ace/mode/css'), [])
  const jsSession = useMemo(() => createEditSession('', 'ace/mode/javascript'), [])
  const iframeEl = useRef<HTMLIFrameElement>(null)
  const [selectState, setSelectState] = useState('html')
  const [workId, setWorkId] = useState<number|''>('')
  const aceEditorEl = useRef<AceEditor>(null)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0)
  const history = useHistory<{filename: string, filebody: string}[]>()

  const downloadZip = useCallback(async () => {
    // DLする前に保存する
    const id = await saveWork({
      'html': htmlSession.getValue(),
      'css': cssSession.getValue(),
      'javascript': jsSession.getValue(),
    }, workId)

    if (id == undefined) return

    setWorkId(id)

    window.open(`${URL}/download/${id}`, '')
  }, [cssSession, htmlSession, jsSession, workId])

  const runButtonClicked = useCallback(async () => {
    // 保存する
    const id = await saveWork({
      'html': htmlSession.getValue(),
      'css': cssSession.getValue(),
      'javascript': jsSession.getValue(),
    }, workId)

    // 保存が失敗していた場合
    if (id == '') return

    setWorkId(id)

    const work = await getWork(id)
    if (work == undefined) return

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

    if (iframeEl.current) {
      iframeEl.current.src = `${URL}/works/${id}/index.html`
    }
  }, [cssSession, htmlSession, jsSession, workId])

  // 入力されているidでwork/{id}をGETで叩いて各editorValueに格納する
  const importButtonClicked = useCallback(async () => {
    if (workId == '') {
      alert('取得に失敗しました. 作品idは空にはできません.')
      return
    }

    const work = await getWork(workId)
    if (work == undefined) {
      alert('取得に失敗しました. idが有効か確認してください.')
      return
    }

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
    if (iframeEl.current) {
      iframeEl.current.src = `${URL}/works/${workId}/index.html`
    }
  }, [cssSession, htmlSession, jsSession, workId])

  const selectedFileChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) =>{
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

  const inputChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(e.target.value)
    setWorkId(isNaN(id) ? '' : id)
  }, [])

  const selectedSizeChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSizeIndex(e.target.selectedIndex)
    if (workId != '' && iframeEl.current) {
      iframeEl.current.src = `${URL}/works/${workId}/index.html`
    }
  }, [workId])

  const printButtonClicked = useCallback(() => {
    history.push('/print', [
      {filename: 'index.html', filebody: htmlSession.getValue()},
      {filename: 'style.css', filebody: cssSession.getValue()},
      {filename: 'index.js', filebody: jsSession.getValue()},
    ])
  }, [cssSession, history, htmlSession, jsSession])

  // エディタのデフォルトsessionの設定
  useEffect(() => {
    aceEditorEl.current?.editor.setSession(htmlSession)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aceEditorEl.current])

  // iframeからエラーメッセージを受け取るイベントの登録
  useEffect(() => {
    window.addEventListener('message', (e:MessageEvent<string>) => {
      alert(e.data)
    })
  }, [])

  return (
    <div>
      <div>
        <button onClick={printButtonClicked}>印刷用ページへ</button>
        <button onClick={downloadZip}>ダウンロード</button>
      </div>
      <div>
        Work ID:
        <input type='number' min='1' value={workId} onChange={inputChanged}/>
        <button onClick={importButtonClicked}>読込</button>
      </div>
      <GridWrapper>
        <Button onClick = {runButtonClicked}>Save</Button>
        <select value={selectState} onChange={selectedFileChanged}>
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
            height = '500px'
            width = '500px'
          />
        </Box1>
        <IFrameContent>
          <iframe
            ref = {iframeEl}
            sandbox = 'allow-scripts allow-modals'
            height = {presetSizes[selectedSizeIndex].height}
            width = {presetSizes[selectedSizeIndex].width}
          />
        </IFrameContent>
      </GridWrapper>
      <select value={selectedSizeIndex} onChange={selectedSizeChanged}>
        {presetSizes.map((item, idx) =>
          <option key={`item-${idx}`} value={idx}>
            {`${item.height}x${item.width}`}
          </option>)}
      </select>
    </div>
  )
}

export default Sample
