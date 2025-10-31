import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'
import Scanner from './pages/Scanner'
import Login from './pages/Login'
import Register from './pages/Register'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div>
        <BrowserRouter>
          <Navbar/>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/scanner' element={<Scanner/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
          </Routes>    
          <Footer/>
        </BrowserRouter>
    </div>
  )
}

export default App
