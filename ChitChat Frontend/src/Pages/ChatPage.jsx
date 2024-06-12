import React, { useEffect } from 'react'
import { ChatState } from '../Components/Authentication/Context/ChatProvider'
import SideDrawer from '../Components/Miscellanious/SideDrawer';
import { Box } from '@chakra-ui/react';
import MyChats from '../Components/Miscellanious/MyChats';
import ChatBox from '../Components/Miscellanious/ChatBox';

const ChatPage = () => {
  
  const {user} = ChatState();

  return (
    <div style={{width: "100%"}}>
      {user && <SideDrawer/>}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats/>}
        {user && <ChatBox/>}
      </Box>
    </div>
  )
}

export default ChatPage