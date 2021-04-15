import React, {useState, useMemo, useCallback} from 'react'
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

const Sample = () => {
  const [htmlEditorValue, setHtmlEditorValue] = useState('<h1>Hello, World!</h1>')
  const [cssEditorValue, setCssEditorValue] = useState('')
  const [scriptEditorValue, setScriptEditorValue] = useState('console.log("called");')
  const [iframeDoc, setIFrameValue] = useState('')
  const [selectState, setSelectState] = useState('html')
  const [workId, setWorkId] = useState<number|undefined>(undefined)

  const buttonClicked = useCallback(() => {
    if (workId == undefined) {
      fetch('http://localhost:5000/work', {
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
          .then((response) => {
            if (!response.ok) throw new Error()
            response.json().then((resJson) => {
              setWorkId(resJson.id)
              fetch(`http://localhost:5000/work/${resJson.id}`, {
                method: 'GET',
              })
                  .then((response) => {
                    if (!response.ok) throw new Error()

                    response.json().then((resJson) => {
                      setIFrameValue(JSON.stringify(resJson))
                    })
                  })
                  .catch((error) => console.error(error))
            })
          })
          .catch((error) => console.error(error))
    } else {
      fetch(`http://localhost:5000/work/${workId}`, {
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
      fetch(`http://localhost:5000/work/${workId}`, {
        method: 'GET',
      })
          .then((response) => {
            if (!response.ok) throw new Error()

            response.json().then((resJson) => {
              setIFrameValue(JSON.stringify(resJson))
            })
          })
          .catch((error) => console.error(error))
    }
  }, [cssEditorValue, htmlEditorValue, scriptEditorValue, workId])

  const [editorValue, setEditorValue] = useMemo(() => {
    const selectMap : SelectMap = {
      'html': [htmlEditorValue, setHtmlEditorValue],
      'css': [cssEditorValue, setCssEditorValue],
      'javascript': [scriptEditorValue, setScriptEditorValue],
    }
    return selectMap[selectState]
  }, [cssEditorValue, htmlEditorValue, scriptEditorValue, selectState])
  const editorChanged = useCallback((val: string) => setEditorValue(val), [setEditorValue])
  const selectChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setSelectState(e.target.value), [])

  return (
    <div>
      <div>Work ID: {workId}</div>
      <GridWrapper>
        <Button onClick = {buttonClicked}>Run</Button>
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
          <IFrame srcDoc = {iframeDoc} />
        </IFrameContent>
      </GridWrapper>
    </div>
  )
}

export default Sample
