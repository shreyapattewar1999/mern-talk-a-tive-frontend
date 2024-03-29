import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import io from "socket.io-client";

import {
  VStack,
  FormControl,
  Input,
  FormLabel,
  Button,
  InputGroup,
  InputRightElement,
  useToast,
  Tooltip,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import { GoogleLogin } from "react-google-login";
import { Socket_ENDPOINT } from "../../../Utility/constants";
import { ChatState } from "../../../Context/ChatProvider";

var socket;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setshow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyEmailFlag, setVerifyEmailFlag] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const toast = useToast();

  const { setuser } = ChatState();

  let navigate = useNavigate();

  const getGuestUserCredentials = () => {
    setEmail("guest@example.com");
    setPassword("guest");
  };

  const updatePasswordHandler = () => {
    if (!email) return;
    navigate("/user/" + email + "/forgotpassword");
  };

  const isValidEmailAddress = (address) => {
    const flag = !!address.match(/.+@.+/);
    setIsEmailValid(flag);
  };

  const submitHandler = async () => {
    setLoading(true);
    let message = "";
    if (!email || !password) {
      if (!email && !password) {
        message = "Please enter email and password to proceed";
      } else if (!email) {
        message = "Please type email id to login";
      } else {
        message = "Please type your login password";
      }

      toast({
        title: message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    } else {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const { data } = await axios.post(
          "/api/user/login",
          {
            email,
            password,
          },
          config
        );
        toast({
          title: "Login successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });

        // here we are emiting logged user data to socket named "setup"
        socket.emit("setup", data);
        setuser(data);
        localStorage.setItem("userInfo", JSON.stringify(data));

        setLoading(false);
        navigate("/chats");
      } catch (error) {
        if (!error?.response?.data?.is_email_verified) {
          toast({
            title: error?.response?.data?.message
              ? error?.response?.data?.message
              : "Unexpected error occurred, please check again your credentials",
            status: "warning",
            duration: 20000,
            isClosable: true,
            position: "bottom",
          });
          setUserId(error?.response?.data?.userId);
          setVerifyEmailFlag(true);
          setLoading(false);

          return;
        }
        toast({
          title: "Error occured !!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }
    }
  };

  const verifyEmailAddress = () => {
    navigate("user/" + userId + "/verify");
  };

  useEffect(() => {
    socket = io(Socket_ENDPOINT);
  }, []);

  const test = (response) => {
    console.log(response);
  };

  return (
    <VStack spacing="5px">
      <FormControl
        id="login_email"
        isRequired
        type="email"
        isInvalid={!isEmailValid}
      >
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter your email"
          onChange={(e) => {
            setEmail(e.target.value);
            isValidEmailAddress(e.target.value);
          }}
          value={email}
        ></Input>
        {!isEmailValid && (
          <FormErrorMessage>Please enter valid email address.</FormErrorMessage>
        )}
      </FormControl>
      <FormControl id="login_password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Input>
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => {
                show ? setshow(false) : setshow(true);
              }}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Tooltip
        label={email.length === 0 ? "Please enter valid email address" : ""}
      >
        <Text
          style={{
            marginRight: "auto",
            color: email.length === 0 ? "grey" : "blue",
            cursor: "pointer",
          }}
          onClick={() => updatePasswordHandler()}
          disabled={email.length !== 0}
        >
          Forgot password ?
        </Text>
      </Tooltip>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        isLoading={loading}
        onClick={submitHandler}
      >
        Login
      </Button>
      <Button
        colorScheme="red"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={getGuestUserCredentials}
      >
        Get Guest User Credentials
      </Button>
      <GoogleLogin
        clientId="640177302186-pa4lpso589ap5ealh7hp0pvmoa7eg7is.apps.googleusercontent.com"
        buttonText="Login/Sign up with Google"
        onSuccess={test}
        onFailure={test}
        cookiePolicy={"single_host_origin"}
      ></GoogleLogin>
    </VStack>
  );
};

export default Login;
