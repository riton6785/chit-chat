import { Button } from '@chakra-ui/react'
import React from 'react'
import { Route } from 'react-router-dom/cjs/react-router-dom.min'
import HomePage from './Pages/HomePage'
import ChatPage from './Pages/ChatPage'
import "./App.css"


const App = () => {
  return (
    <div className='app'>
      <Route path="/" component={HomePage} exact/>
      <Route path="/chats" component={ChatPage}/>
    </div>
  )
}

export default App