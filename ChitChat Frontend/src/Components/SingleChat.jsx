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
import io from "socket.io-client"
import Lottie from "react-lottie"
import animationData from "../Animations/typing.json"

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;
const SingleChat = ({fetchAgain, setFetchAgain}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const {user, selectedChat, setSelectedChat, notification, setNotification} = ChatState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [ typing, setTyping ] = useState(false);
  const [ isTyping, setIsTyping ] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidMid slice"
    }
  }
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
      socket.emit("join-room", selectedChat._id)
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
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", ()=> setSocketConnected(true))
    socket.on("typing", ()=> setIsTyping(true));
    socket.on("stop typing", ()=> setIsTyping(false));
  },[])

  useEffect(()=> {
    fetchMessages();
    selectedChatCompare = selectedChat
  }, [selectedChat])

  console.log(notification, "___________________________________")
  useEffect(()=> {
    socket.on("message-recieved", (newMessageRecieved) => {
      if( !selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
        if ( !notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain)
        }
      } else {
        setMessages([...messages, newMessageRecieved])
      }
    })
  })


  const sendMessage = async(event) => {
    if (event.key === "Enter" && newMessage ) {
      socket.emit("stop typing", selectedChat._id);
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
        socket.emit("new-message", data)
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
    if(!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    // Logic to stop typing whenever time stops more than 4 second

    var lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(()=> {
      console.log("4 second logic")
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if(timeDiff > timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength)
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
              {isTyping ? <div>
                          <Lottie options={defaultOptions} width={70} style={{marginBottom: 15, marginLeft: 0}}/>
              </div>: (<></>)}
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