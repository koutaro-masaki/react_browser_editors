import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react'
import {Link, useHistory} from 'react-router-dom'

const URL = 'http://localhost:5000'

const WorkSpaceHome = () => {
  const [workIDList, setWorkIDList] = useState<number[]>([])
  const history = useHistory()

  const createButtonClicked = useCallback(async () => {
    const id = await fetch(`${URL}/work`, {method: 'POST'})
        .then(async (res) => {
          if (!res.ok) {
            throw new Error()
          }
          return await res.json().then((result: {id:number}) => result.id)
        })
        .catch((error) => {
          console.log(error)
          return undefined
        })

    if (id != undefined) {
      history.push(`/workspace/${id}`)
    }
  }, [history])

  useEffect(() => {
    const fetchIDList = async () => {
      const data = await fetch(`${URL}/works`, {method: 'GET'})
          .then(async (responce) => {
            if (!responce.ok) {
              throw new Error()
            }
            return await responce.json().then((arr:number[]) => arr)
          })
          .catch((error) => alert(error))
      if (data) {
        setWorkIDList(data)
      }
    }

    fetchIDList()
  }, [])

  return (
    <div>
      <h2>
        作品一覧
      </h2>
      <button onClick={createButtonClicked}>新規作成</button>
      <ul>
        {workIDList.map((id) => (<li key={id}><Link to={`/workspace/${id}`}>{id}</Link></li>))}
      </ul>
    </div>
  )
}

export default WorkSpaceHome
