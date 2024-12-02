import React, { useEffect, useState } from 'react'
import { ChatState } from '../Components/Authentication/Context/ChatProvider'
import SideDrawer from '../Components/Miscellanious/SideDrawer';
import { Box } from '@chakra-ui/react';
import MyChats from '../Components/Miscellanious/MyChats';
import ChatBox from '../Components/Miscellanious/ChatBox';
import { socketconnector } from '../config/ChatLogic';

var socketInitializer;
const ChatPage = () => {
  useEffect(()=> {
    socketInitializer = socketconnector();
  },[])
  
  const {user} = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);


  return (
    <div style={{width: "100%"}}>
      {user && <SideDrawer socketInitializer={socketInitializer}/>}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} socketInitializer={socketInitializer}/>}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} socketInitializer={socketInitializer}/>}
      </Box>
    </div>
  )
}

export default ChatPage