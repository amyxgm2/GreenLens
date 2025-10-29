import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'
import Scanner from './pages/Scanner'
import History from './pages/History'

function App() {
  return (
    <div>
        <BrowserRouter>
          <Navbar/>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/scanner' element={<Scanner/>}/>
            <Route path='/history' element={<History/>}/>
          </Routes>    
        </BrowserRouter>
    </div>
  )
}

export default App
