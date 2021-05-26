import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react'
import {createEditSession} from 'ace-builds'
import {useHistory, useParams} from 'react-router-dom'
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

interface File {
  name: string,
  body: string
}
interface Work {
  html: string,
  css: string,
  javascript: string,
  files: File[]
}

const presetSizes : {height:number, width:number}[] = [
  {height: 320, width: 320},
  {height: 480, width: 320},
  {height: 300, width: 400},
  {height: 480, width: 600},
  {height: 800, width: 800},
]

const Sample = () => {
  const htmlSession = useMemo(() => createEditSession('', 'ace/mode/html'), [])
  const cssSession = useMemo(() => createEditSession('', 'ace/mode/css'), [])
  const jsSession = useMemo(() => createEditSession('', 'ace/mode/javascript'), [])
  const iframeEl = useRef<HTMLIFrameElement>(null)
  const [selectState, setSelectState] = useState('javascript')
  const aceEditorEl = useRef<AceEditor>(null)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0)
  const history = useHistory<{filename: string, filebody: string}[]>()
  const {id} = useParams<{id:string | undefined}>()
  const [initialized, setInitialized] = useState(false)

  const downloadZip = useCallback(async () => {
    // DLする前に保存する
    const init = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'html': htmlSession.getValue(),
        'css': cssSession.getValue(),
        'javascript': jsSession.getValue(),
      }),
    }

    const success = await fetch(`${URL}/work/${id}`, init)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`)
          }
          return true
        })
        .catch((error) => {
          console.error(error)
          alert('保存に失敗しました')
          return false
        })
    if (iframeEl.current) {
      iframeEl.current.src = `${URL}/work/${id}/index.html`
    }

    if (!success) return

    window.open(`${URL}/download/${id}`, '')
  }, [cssSession, htmlSession, id, jsSession])

  const runButtonClicked = useCallback(async () => {
    // 保存する
    const init = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'html': htmlSession.getValue(),
        'css': cssSession.getValue(),
        'javascript': jsSession.getValue(),
      }),
    }

    await fetch(`${URL}/work/${id}`, init)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`)
          }
        })
        .catch((error) => {
          console.error(error)
          alert('保存に失敗しました')
        })

    if (iframeEl.current) {
      iframeEl.current.src = `${URL}/work/${id}/index.html`
    }
  }, [cssSession, htmlSession, id, jsSession])

  const selectedFileChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
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
  }, [cssSession, htmlSession, jsSession])

  const selectedSizeChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSizeIndex(e.target.selectedIndex)
    if (iframeEl.current) {
      iframeEl.current.src = `${URL}/work/${id}/index.html`
    }
  }, [id])

  const printButtonClicked = useCallback(() => {
    history.push('/print', [
      {filename: 'index.html', filebody: htmlSession.getValue()},
      {filename: 'style.css', filebody: cssSession.getValue()},
      {filename: 'index.js', filebody: jsSession.getValue()},
    ])
  }, [cssSession, history, htmlSession, jsSession])

  const handleAddFileButton = useCallback(() => {
    fetch(`${URL}/work/${id}/poyo/javascript`, {method: 'POST'})
        .then((res) => {
          if (!res.ok) {
            alert('失敗(ミス)っちまったよ…')
          }
        })
  }, [id])

  // ワークスペースの初期化処理
  useEffect(() => {
    if (id == undefined) return

    const fetchWork = async () => {
      const work = await fetch(`${URL}/work/${id}`, {method: 'GET'}).then(async (res) => {
        if (!res.ok) return
        return await res.json().then((j:Work) => j)
      }).catch((error) => {
        alert(error)
        return undefined
      })

      if (work) {
        htmlSession.setValue(work.html)
        cssSession.setValue(work.css)
        jsSession.setValue(work.javascript)
        if (iframeEl.current) {
          iframeEl.current.src = `${URL}/work/${id}/index.html`
        }
      }
      // エディタのデフォルトsessionの設定
      aceEditorEl.current?.editor.setSession(jsSession)
      // 初期化完了
      setInitialized(true)
    }

    fetchWork()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // iframeからエラーメッセージを受け取るイベントの登録
  useEffect(() => {
    window.addEventListener('message', (e:MessageEvent<string>) => {
      console.log(e.origin)
      if (e.origin != URL) return
      alert(e.data)
    })
  }, [])

  return (
    <div>
      <div>
        <button onClick={printButtonClicked} disabled={!initialized}>印刷用ページへ</button>
        <button onClick={downloadZip} disabled={!initialized}>ダウンロード</button>
        <button onClick={handleAddFileButton}>ファイル追加</button>
      </div>
      <div>
        Work ID: {id}
      </div>
      <GridWrapper>
        <Button onClick = {runButtonClicked} disabled={!initialized}>実行</Button>
        <select value={selectState} onChange={selectedFileChanged} disabled={!initialized}>
          <option value='html'>HTML</option>
          <option value='css'>CSS</option>
          <option value='javascript'>JavaScript</option>
        </select>
        <Box1>
          <AceEditor
            ref = {aceEditorEl}
            readOnly = {!initialized}
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
      <select value={selectedSizeIndex} onChange={selectedSizeChanged} disabled={!initialized}>
        {presetSizes.map((item, idx) =>
          <option key={`item-${idx}`} value={idx}>
            {`${item.height}x${item.width}`}
          </option>)}
      </select>
    </div>
  )
}

export default Sample
