import React, { useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Tabs,
  TabPanels,
  TabList,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import Login from "./components/Authentication/Login";
import SignUp from "./components/Authentication/SignUp";

const HomePage = () => {
  let navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Container maxW="lg" centerContent>
      <Box
        p={3}
        justifyContent="center"
        bg={"white"}
        w="100%"
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
          <Tabs variant="soft-rounded">
            <TabList>
              <Tab width="50%">Login</Tab>
              <Tab width="50%">Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login></Login>
              </TabPanel>
              <TabPanel>
                <SignUp></SignUp>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
