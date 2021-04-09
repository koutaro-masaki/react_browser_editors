import React from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-monokai'

const AceEditorPage = () => {
  return (
    <div>
      <h2>
        Ace Editor
      </h2>
      <AceEditor
        mode = 'javascript'
        theme = 'monokai'
        name = 'ace-editor-sample'
        height = '200px'
        width = '320px'
      />
    </div>
  )
}

export default AceEditorPage
