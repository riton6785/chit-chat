import React, { useEffect, useState } from 'react'
import { ChatState } from './Authentication/Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useStatStyles, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from "@chakra-ui/icons"
import { getSenderFull, getSender } from '../config/ChatLogic'
import  ProfileModal  from "./Miscellanious/ProfileModal"
import UpdateGroupChatModal from './Miscellanious/UpdateGroupChatModal'
import axios from 'axios'
import "./User/styles.css"
import ScrollableChat from './Miscellanious/ScrollableChat'
const SingleChat = ({fetchAgain, setFetchAgain}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const {user, selectedChat, setSelectedChat} = ChatState()
  const toast = useToast();

  const fetchMessages = async () => {
    if( !selectedChat ) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/message/${selectedChat._id}`, config)
      setMessages(data)
      console.log(data)
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occured",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      });
    }
  }
  useEffect(()=> {
    fetchMessages();
  }, [selectedChat])

  const sendMessage = async(event) => {
    if (event.key === "Enter" && newMessage ) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
        setNewMessage("");
        const { data } = await axios.post("http://localhost:5000/api/message", {
          content: newMessage,
          chatId: selectedChat._id,
        }, config)
        setMessages([...messages, data]);
        
      } catch (error) {
        toast({
          title: "Error occured",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        })
      }
    }
  }

  const typingHandler = (e) => {
    setNewMessage(e.target.value)

  }
  return (
    <>
      {
        selectedChat ? (
          <>
            <Text fontSize={{base: "28px", md: "30px"}} pb={3} px={2} w="100%" fontFamily="Work sans" display="flex" justifyContent={{base: "space-between"}} alignItems="center">
              <IconButton display={{base: "flex", md: "none"}} icon={<ArrowBackIcon/>} onClick={()=>setSelectedChat("")}/>
              {
                !selectedChat.isGroupChat ? (
                  <>
                    {getSender(user, selectedChat.users)}
                    <ProfileModal user={getSenderFull(user, selectedChat.users)}/>
                    
                  </>
                ): (
                  <>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages}/>
                  </>
                )
              }
            </Text>
            <Box display="flex" flexDirection="column" justifyContent="flex-end" p={3} bg="#E8E8E8" w="100%" h="100%" borderRadius="lg" overflow="hidden">
              {
                loading ? (
                  <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto"/>
                ): (
                  <div className='messages'>
                    <ScrollableChat messages={messages }/>
                  </div>
                )
              }
              <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                <Input variant="filled" bg="#E0E0E0" placeholder='Enter a message' onChange={typingHandler} value={newMessage}/>
              </FormControl>
            </Box>
          </>
        ): (
          <Box display="flex" alignItems="center" justifyContent="center" h="100%">
            <Text fontSize="3xl" pb={3} fontFamily="work sans">
              Click on user to start chatting
            </Text>
          </Box>
        )
      }
    </>
  )
}

export default SingleChat