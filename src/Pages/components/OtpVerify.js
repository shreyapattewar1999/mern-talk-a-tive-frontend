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
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import axios from "axios";

const OtpVerify = () => {
  const params = useParams();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const toast = useToast();

  return <div>OtpVerify</div>;
};

export default OtpVerify;
