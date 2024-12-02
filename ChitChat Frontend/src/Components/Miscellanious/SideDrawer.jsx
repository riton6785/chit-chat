import React, { useState } from 'react'
import { ChatState } from '../Authentication/Context/ChatProvider'
import {Box, Button, Tooltip, Text, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios'
import ChatLoading from '../ChatLoading';
import UserListItem from '../User/UserListItem';
import { getSender } from '../../config/ChatLogic';
import NotificationBadge from 'react-notification-badge'
import {Effect} from "react-notification-badge"

const SideDrawer = ({socketInitializer}) => {
  const {user, selectedChat, setSelectedChat, chats, setChats, notification, setNotification} = ChatState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    socketInitializer.disconnect();
    history.push("/")
  }
  const handleClick = async ()=> {
    if(!search) {
      toast({
        title: "Please search something",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: 'top-left'
      })
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
      }
      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config)
      setLoading(false)
      setSearchResult(data)
    } catch (error) {
      toast({
        title: "Error occured",
        description: "Failed to load the search result",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })
    }
  }
  
  const accessChat = async(userId) => {
    try {
      setLoadingChat(true)
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        }
      }
      const { data } = await axios.post(`http://localhost:5000/api/chat`, {userId}, config)
      if (!chats.find((c)=> c.id === data.id)) setChats([data, ...chats])
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error occured",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      });
    }
  }
  return (
    <>
      <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bg="white"
      w="100%"
      p="5px 10px 5px 10px"
      borderWidth="5px"
      >
        <Tooltip label="Search User to chat" hasArrow placement='bottom-end'>
          <Button variant="ghost" onClick={onOpen}>
            <i className='fas fa-search'></i>
            <Text px="4" display={{base:"none", md:"flex"}}> Search User</Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="work sans">Chit Chat</Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
              count={notification.length}
              effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1}/>
            </MenuButton>
            <MenuList>
              {!notification.length && "No new messages"}
              {
                notification.map((notif)=> (
                  <MenuItem key={notif._id} onClick={()=> {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n)=> n !== notif));
                  }}>
                    {
                      notif.chat.isGroupChat ? `New Message recieved in ${notif.chat.chatName}`
                      : `New message recieved from ${getSender(user, notif.chat.users)}`
                    }
                  </MenuItem>
                ))
              }
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}/>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem> MY Profile</MenuItem>
              </ProfileModal>
              <MenuDivider/>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer  placement='left' isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader>Search User</DrawerHeader>
          <DrawerBody>
            <Box display='flex' pb={2}>
              <Input placeholder='Search by name or Email' mr={2} value={search} onChange={(e)=> setSearch(e.target.value)}/> 
              <Button onClick={handleClick}>Go</Button>
            </Box>
            {
              loading ? <ChatLoading/> : (
               searchResult.map((user) => (
                <UserListItem key={user._id} user={user} handleFunction={()=> accessChat(user._id)}/>
               ))
              )
            }
            {loadingChat && <Spinner ml='auto' display='flex'/>}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer