//Home page of Website

import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [msg, setMsg] = useState('')

  useEffect(() => {

    axios.get('http://localhost:8001')
    .then(res => setMsg(res.data.message))
    .catch(err => console.log(err))
  }, []);


  return (
    <div class="text-2xl p-6 text-blue-600 font-semibold">

      <p>FastAPI's message is {msg} </p>

    </div>
  )
}

export default App
