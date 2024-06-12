import React, { useEffect } from 'react'
import { Container, Text, Box, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react"
import Login from '../Components/Authentication/Login'
import Signup from '../Components/Authentication/Signup'
import { useHistory } from 'react-router-dom'

const HomePage = () => {
  const history = useHistory();
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if(userInfo) {
      history.push("/chats");
    }
  }, [history])
  return (
    <Container maxW="xl" centerContent>
      <Box
      display="flex"
      justifyContent="center"
      p={3}
      bg="white"
      w="100%"
      m="40px 0 15px 0"
      borderRadius="lg"
      borderWidth="1px"
      >
        <Text fontSize="4xl" color="black" fontFamily="work sans">Have Some ChitChat</Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="1px" color="black">
        <Tabs variant="soft-rounded">
          <TabList mb="1em">
            <Tab w="50%">Login</Tab>
            <Tab w="50%">SignUP</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login/>
            </TabPanel>
            <TabPanel>
              <Signup/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default HomePage