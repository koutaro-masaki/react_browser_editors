import React from 'react'
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

const Box2 = styled.div({
  gridColumn: '1',
  gridRow: '3',
})

const Box3 = styled.div({
  gridColumn: '1',
  gridRow: '4',
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

const Sample = () => (
  <GridWrapper>
    <Button onClick = {()=> alert('infinite alert')}>Run</Button>
    <Box1>
      <AceEditor
        mode = 'html'
        theme = 'monokai'
        name = 'html-editor'
        height = '200px'
        width = '320px'
        placeholder = 'HTML'
      />
    </Box1>
    <Box2>
      <AceEditor
        mode = 'css'
        theme = 'monokai'
        name = 'html-editor'
        height = '200px'
        width = '320px'
        placeholder = 'CSS'
      />
    </Box2>
    <Box3>
      <AceEditor
        mode = 'javascript'
        theme = 'monokai'
        name = 'html-editor'
        height = '200px'
        width = '320px'
        placeholder = 'JavaScript'
      />
    </Box3>
    <IFrameContent>
      <IFrame></IFrame>
    </IFrameContent>
  </GridWrapper>
)

export default Sample
