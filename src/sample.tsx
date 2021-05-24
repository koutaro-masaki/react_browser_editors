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

const Sample = () => {
  const htmlSession = useMemo(() => createEditSession('<!DOCTYPE html>\n<h1>Hello, World!</h1>', 'ace/mode/html'), [])
  const cssSession = useMemo(() => createEditSession('', 'ace/mode/css'), [])
  const jsSession = useMemo(() => createEditSession('', 'ace/mode/javascript'), [])
  const iframeEl = useRef<HTMLIFrameElement>(null)
  const [selectState, setSelectState] = useState('html')
  const aceEditorEl = useRef<AceEditor>(null)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0)
  const history = useHistory<{filename: string, filebody: string}[]>()
  const {id} = useParams<{id:string | undefined}>()

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
      iframeEl.current.src = `${URL}/works/${id}/index.html`
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
      iframeEl.current.src = `${URL}/works/${id}/index.html`
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aceEditorEl.current])

  const selectedSizeChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSizeIndex(e.target.selectedIndex)
    if (iframeEl.current) {
      iframeEl.current.src = `${URL}/works/${id}/index.html`
    }
  }, [id])

  const printButtonClicked = useCallback(() => {
    history.push('/print', [
      {filename: 'index.html', filebody: htmlSession.getValue()},
      {filename: 'style.css', filebody: cssSession.getValue()},
      {filename: 'index.js', filebody: jsSession.getValue()},
    ])
  }, [cssSession, history, htmlSession, jsSession])

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
          iframeEl.current.src = `${URL}/works/${id}/index.html`
        }
      }
    }

    fetchWork()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        Work ID: {id}
      </div>
      <GridWrapper>
        <Button onClick = {runButtonClicked}>実行</Button>
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
