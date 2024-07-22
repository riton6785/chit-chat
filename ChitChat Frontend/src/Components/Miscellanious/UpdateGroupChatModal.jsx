import { ViewIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../Authentication/Context/ChatProvider';
import UserBadgeItem from '../User/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../User/UserListItem';

const UpdateGroupChatModal = ({fetchAgain, setFetchAgain, fetchMessages}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState();
    const [searchResult, setSearchResult] = useState();
    const [ loading, setLoading] = useState();
    const [ renameLoading, setRenameLoading] = useState();

    const {user, selectedChat, setSelectedChat} = ChatState();

    const toast = useToast();

    const handleRemove = async(usertoRemove) => {
        if (selectedChat.groupAdmin._id !== user._id && usertoRemove._id !== user._id){
            toast({
                title: "Only Admins can remove",
                status: "error",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom',
            })
            return
        }
        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }
            const { data } = await axios.put("http://localhost:5000/api/chat/groupremove",{
                chatId: selectedChat._id,
                userId: usertoRemove._id,
            },config);
            usertoRemove._id === user._id ? setSelectedChat(): setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error occurred",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false)
        }

    }
    const handleAddUser= async(usertoAdd) => {
        if(selectedChat.users.find((u)=>u._id === usertoAdd._id)) {
            toast({
                title: "User Already exists in group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })
            return
        }
        if(selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only Admin can can add some one to group",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.put("http://localhost:5000/api/chat/groupadd", {
                chatId: selectedChat._id,
                userId: usertoAdd,
            }, config)
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false)
            
        } catch (error) {
            toast({
                title: "Error occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false)
        }
    }
    const handleRename = async() => {
        if(!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.put("http://localhost:5000/api/chat/rename", {
                chatId: selectedChat._id,
                chatName: groupChatName,
            }, config)
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false)
        } catch (error) {
            toast({
                title: "Error Ocured",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setRenameLoading(true)
        }
        setGroupChatName("");
    }
    const handleSearch = async(query) => {
        setSearch(query);
        if ( !query ) {
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                }
              }
              const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config)
              setLoading(false);
              setSearchResult(data);
              console.log(data);
        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            })
        }

    }
  return (
    <>
        <IconButton display={{base: "flex"}} icon={<ViewIcon/>} onClick={onOpen}/>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>{selectedChat.chatName}</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                        {
                            selectedChat.users.map((u)=> (
                                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemove(u)}/>
                                
                            ))
                        }
                    </Box>
                    <FormControl display="flex">
                        <Input placeholder='Chat Name' mb={3} value={groupChatName} onChange={(e)=>setGroupChatName(e.target.value)}/>
                        <Button variant="solid" colorScheme='teal' ml={1} isLoading={renameLoading} onClick={handleRename}>
                            Update
                        </Button>
                    </FormControl>
                    <FormControl>
                        <Input placeholder='Add User to a group' mb={1} onChange={(e) => handleSearch(e.target.value)}/>
                    </FormControl>
                    {
                        loading ? (
                            <Spinner size="lg"/>
                        ): (
                            searchResult?.map((user)=>(
                                <UserListItem key={user._id} user={user} handleFunction={()=> handleAddUser(user)}/>
                            ))
                        )
                    }
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='red' mr={3} onClick={()=> handleRemove(user)}>
                        Leave Group
                    </Button>
                </ModalFooter>
            </ModalContent>

        </Modal>
    </>
  )
}

export default UpdateGroupChatModal