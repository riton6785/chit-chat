import React, { useState } from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, Toast, VStack, useToast } from '@chakra-ui/react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import axios from 'axios';

const Login = () => {
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [loading, setLoading] = useState();
    const toast = useToast();
    const history = useHistory();

    const handleClick = () => setShow(!show)

    const submitHandler = async() =>{

      if (!email || !password) {
        toast({
          title: "please fill all the fields",
          status: "warning",
          duration: 5000,
          inClosable: true,
          position: "bottom",        
        });
        setLoading(true)
        return
      }
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };
        const { data } = await axios.post(
          "http://localhost:5000/api/user/login",
          {email, password},
          config
          )
    
          toast({
            title: "Logged in successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: 'bottom',
          })
          localStorage.setItem('userInfo', JSON.stringify(data))
          setLoading(false);
          history.push("/chats")
      } catch (error) {
        toast({
          title: "error occured",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: 'bottom'
    
        })
        setLoading(false)
      }
    }
  return (
    <VStack spacing="5px">
        <FormControl id="login_email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input placeholder='enter your email' onChange={(e)=>setEmail(e.target.value)} value={email}/>
        </FormControl>
        <FormControl id="login_password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
            <Input 
            type={show ? "text": "password"}
            placeholder='enter your password' onChange={(e)=>setPassword(e.target.value)} value={password}/>
            <InputRightElement width="4.5rem">
              <Button height="1.75rem" size="sm" onClick={handleClick}>{show? "Hide" : "show"}</Button>
            </InputRightElement>
            </InputGroup>
        </FormControl>
        <Button
          colorScheme='blue'
          width="100%"
          style={{marginTop: 15}}
          onClick={submitHandler}
          isLoading = {loading}
        >
          Login
        </Button>
        <Button 
        variant="solid"
        colorScheme='red'
        width="100%"
        onClick={()=>{
          setEmail("guest@example.com")
          setPassword("123456")
        }}
        >
          Get Guest User Credentials
        </Button>

    </VStack>
  )
}

export default Login