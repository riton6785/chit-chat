import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [show, setShow] = useState(false)
    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [confirmpassword, setConfirmpassword] = useState()
    const [pic, setPic] = useState()
    const [loading, setLoading] = useState()
    const toast = useToast()
    const history = useHistory()

    const handleClick = () => setShow(!show)

    const postDetails = (pic) => {
      setLoading(true)

      if ( pic === undefined) {
        toast({
          title: "please select a image",
          status: "warning",
          duration: 5000,
          inClosable: true,
          position: "bottom",        
        });
        return
      }
      if ( pic.type === "image/jpeg" || pic.type === "image/png") {
        const data = new FormData();
        data.append("file", pic);
        data.append("upload_preset", "chat-app");
        data.append("cloud_name", "dcjknvxf1");
  
        fetch("https://api.cloudinary.com/v1_1/dcjknvxf1/image/upload", {
          method: "post",
          body: data,
        }).then((res)=>res.json())
          .then((data)=> {
            setPic(data.url.toString())
            setLoading(false);
          })
          .catch((error)=> {
            setLoading(false)
          })
         
      } else {
        toast({
          title: "please select a image",
          status: "warning",
          duration: 5000,
          inClosable: true,
          position: "bottom",        
        });
        return
      }
    }
    const submitHandler = async () =>{
      setLoading(true)
      if( !name || !email || !password || !confirmpassword || !confirmpassword || !pic) {
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
    
      if( password !== confirmpassword ) {
        toast({
          title: "Password and confirm password should be same",
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
          "http://localhost:5000/api/user",
          {name, email, password, pic},
          config
          )
    
          toast({
            title: "Registration successful",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: 'bottom',
          })
          localStorage.setItem("userInfo", JSON.stringify(data));
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
        <FormControl id="first-name" isRequired>
            <FormLabel>Name</FormLabel>
            <Input placeholder='enter your name' onChange={(e)=>setName(e.target.value)}/>
        </FormControl>
        <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input placeholder='enter your email' onChange={(e)=>setEmail(e.target.value)}/>
        </FormControl>
        <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
            <Input 
            type={show ? "text": "password"}
            placeholder='enter your password' onChange={(e)=>setPassword(e.target.value)}/>
            <InputRightElement width="4.5rem">
              <Button height="1.75rem" size="sm" onClick={handleClick}>{show? "Hide" : "show"}</Button>
            </InputRightElement>
            </InputGroup>
        </FormControl>
        <FormControl id="confrm_password" isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
            <Input 
            type={show ? "text": "password"}
            placeholder='Confirm your password' onChange={(e)=>setConfirmpassword(e.target.value)}/>
            <InputRightElement width="4.5rem">
              <Button height="1.75rem" size="sm" onClick={handleClick}>{show? "Hide" : "show"}</Button>
            </InputRightElement>
            </InputGroup>
        </FormControl>
        
        <FormControl id="pic" isRequired>
            <FormLabel>Upload pic</FormLabel>
            <Input 
              type='file'
              p={1.5}
              accept="image/*"
              onChange={(e)=> postDetails(e.target.files[0])}
            />
        </FormControl>
        <Button
          colorScheme='blue'
          width="100%"
          style={{marginTop: 15}}
          onClick={submitHandler}
          isLoading={loading}
        >
          Sign Up
        </Button>
    </VStack>
  )
}

export default Signup