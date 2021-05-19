import React, {useCallback, useEffect, useMemo, useRef} from 'react'
import {useLocation} from 'react-router-dom'

const PrintPage = () => {
  const location = useLocation<{filename: string, filebody: string}[]>()
  const onClick = useCallback(() => {
    window.print()
  }, [])
  const textAreaEls = [
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
    useRef<HTMLTextAreaElement>(null),
  ]

  return (
    <div>
      <button onClick={onClick}>印刷</button>
      {location.state.map((item, i) => {
        return (<div key={i}>
          <h3>{item.filename}</h3>
          <textarea ref={textAreaEls[i]} readOnly cols={100} wrap='soft'>{item.filebody}</textarea>
        </div>)
      })}
    </div>
  )
}

export default PrintPage
