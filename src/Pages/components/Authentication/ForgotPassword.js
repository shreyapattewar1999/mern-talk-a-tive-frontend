import React, { useState, useEffect } from "react";
import {
  VStack,
  FormControl,
  Input,
  FormLabel,
  Button,
  InputGroup,
  InputRightElement,
  useToast,
  Text,
  Box,
  Container,
  Tooltip,
  HStack,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import OtpInput from "react-otp-input";

const ForgotPassword = () => {
  const params = useParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [enablePasswordChange, setEnablePasswordChange] = useState(false);
  const [password, setPassword] = useState("");
  const [show, setshow] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const toast = useToast();

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  let navigate = useNavigate();

  const generateOtp = async () => {
    setIsOtpVerified(false);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user/generateOtp",
        {
          email: params?.email,
        },
        config
      );
      toast({
        title: "Otp sent successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: error?.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // from react18 onwards, useEffect with empty dependency array will be called twice only in DEVELOPMENT mode
  useEffect(() => {
    setEmail(params?.email);
    if (params?.email) {
      generateOtp();
    }
  }, [params?.email]);

  const updatePasswordHandler = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const reqBody = { email, password };
      const { data } = await axios.put(
        "/api/user/updatepassword",
        reqBody,
        config
      );
      toast({
        title: "Password has been updated",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      navigate("/");
    } catch (error) {
      toast({
        title: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const verifyOtp = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const reqBody = { email, entered_otp: otp };
      const { data } = await axios.post("/api/user/verifyotp", reqBody, config);
      toast({
        title: data?.message,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setEnablePasswordChange(true);
      setIsOtpVerified(true);
    } catch (error) {
      toast({
        title: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  return (
    <Container maxW="lg" centerContent>
      <Box
        p={3}
        justifyContent="center"
        bg={"white"}
        w="110%"
        m="15px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        {/* Box works exactly same as div */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Text fontSize="4xl" fontFamily="Work Sans" color="black">
            Talk-A-Tive
          </Text>
        </div>
        <Box
          bg="white"
          w="100%"
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          color="black"
        >
          <VStack spacing="5px">
            <FormControl id="login_email" isRequired>
              <FormLabel>Email</FormLabel>
              <Tooltip label="Email address cannot be changed">
                <Input
                  readOnly={true}
                  backgroundColor="#d9d9d9"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                ></Input>
              </Tooltip>
            </FormControl>
            {isOtpVerified ? (
              <>
                <Text color="green" as="b">
                  Otp Verified Successfully
                </Text>
              </>
            ) : (
              <>
                <HStack>
                  <OtpInput
                    value={otp}
                    onChange={(newOtp) => setOtp(newOtp)}
                    numInputs={6}
                    separator={<span>-</span>}
                    isInputNum={true}
                    inputStyle={{
                      width: "2em",
                      height: "2.5em",
                      margin: "0.5em",
                      borderWidth: "1px",
                      borderRadius: "5px",
                      borderColor: "black",
                    }}
                  ></OtpInput>
                  <VStack>
                    <Button
                      colorScheme="green"
                      size="sm"
                      width="100%"
                      onClick={() => verifyOtp()}
                    >
                      Verify Otp
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      width="100%"
                      onClick={() => generateOtp()}
                    >
                      Regenerate Otp
                    </Button>
                  </VStack>
                </HStack>
              </>
            )}
            {enablePasswordChange && (
              <>
                <FormControl id="password" isRequired>
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

                <FormControl id="confirmPassword" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      value={confirmPassword}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    ></Input>
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => {
                          showConfirmPassword
                            ? setShowConfirmPassword(false)
                            : setShowConfirmPassword(true);
                        }}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <Button
                  colorScheme="blue"
                  width="100%"
                  style={{ marginTop: 15 }}
                  // isLoading={loading}
                  onClick={() => updatePasswordHandler()}
                >
                  Change Password
                </Button>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
