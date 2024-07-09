import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../Authentication/Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../User/UserListItem';
import UserBadgeItem from '../User/UserBadgeItem';

const GroupChatModal = ({children}) => {
    const { isOpen, onOpen, onClose} = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState();
    const [loading, setLoading] = useState(false)

    const toast = useToast();

    const { user, chats, setChats} = ChatState();

    const handleSearch = async (query) => {
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

    const handleSubmit = async()=> {
        if ( !groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return
        }
        try {
            debugger
            const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                }
            }
            const { data } = await axios.post("http://localhost:5000/api/chat/group", {
            name: groupChatName,
            users: JSON.stringify(selectedUsers.map((u)=>u._id))
            }, config)
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })
            
        } catch (error) {
            toast({
                title: "Failed t create the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom',
            })
        }
    }

    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)) {
            toast({
                title: "User Already exists",
                Status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return
        }
        setSelectedUsers([...selectedUsers, userToAdd])
    }

    const handleDelete = (userToDelete) => {
        setSelectedUsers(selectedUsers.filter((selUser)=> selUser._id !== userToDelete._id))
    }
  return (
    <>
        <span onClick={onOpen}>{children}</span>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader fontSize="35px" fontFamily="Work sans" display="flex" justifyContent="center">Create Group Chat</ModalHeader>
                <ModalCloseButton/>
                <ModalBody display="flex" flexDir="column" alignItems="center">
                    <FormControl>
                        <Input placeholder='Chat Name' mb='3' onChange={(e) => setGroupChatName(e.target.value)}/>
                    </FormControl>
                    <FormControl>
                        <Input placeholder='Add users eg: Will, john etc...' mb={1} onChange={(e) => handleSearch(e.target.value)}/>
                    </FormControl>
                    <Box w="100%" display="flex" flexWrap="wrap">
                        {
                            selectedUsers.map((u)=> (
                                <UserBadgeItem key={user._id} user={u} handleFunction={() => handleDelete(u)}/>
                            ))
                        }

                    </Box>
                    {
                        loading ? (
                            <span>loading..</span>
                        ): (
                            searchResult?.slice(0, 4).map((user)=> (
                                <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)}/>
                            ))
                        )
                    }
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' onClick={handleSubmit}>Create Chat</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
  )
}

export default GroupChatModal