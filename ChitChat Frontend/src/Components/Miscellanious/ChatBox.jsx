import { Box } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../Authentication/Context/ChatProvider'
import SingleChat from '../SingleChat'

const ChatBox = ({fetchAgain, setFetchAgain, socketInitializer}) => {
  const {selectedChat} = ChatState()
  return (
    <Box
      display={{base: selectedChat ? "flex": "none", md: "flex"}}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{base: "100%", md: "68%"}}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} socketInitializer={socketInitializer}/>
    </Box>
  )
}

export default ChatBox