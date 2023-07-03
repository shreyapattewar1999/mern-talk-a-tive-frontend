import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaCheckCircle,
  FaWindowClose,
  FaExclamationCircle,
} from "react-icons/fa";
import { Spinner, useToast } from "@chakra-ui/react";

const EmailVerify = () => {
  const [validUrl, setValidUrl] = useState(0);
  const params = useParams();
  const toast = useToast();

  // validUrl values
  // 0 --> api response is pending
  // 1 --> email verified successfully
  // 2 --> email not verified

  const verifyEmail = async () => {
    try {
      const { data } = await axios.get(
        `/api/user/${params.id}/verify/${params.timestamp}`
      );
      if (data.validUrl) {
        toast({
          title: data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setValidUrl(data.validUrl);
      }
    } catch (error) {
      // console.log(error);
      if (error?.response?.data?.validUrl) {
        toast({
          title: error.response.data.message,
          status: "error",
          duration: 20000,
          isClosable: true,
          position: "bottom",
        });
        setValidUrl(error?.response?.data?.validUrl);
      }
      // setValidUrl(2);
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [params]);

  return (
    <div className="verifyContainer">
      {validUrl === 0 && (
        <>
          <Spinner size="xl" />
          <div style={{ fontSize: "250%" }}>
            Please be patient, your email is getting verified
          </div>
        </>
      )}

      {validUrl === 1 && (
        <>
          <div
            style={{
              fontSize: "1000%",
              color: "white",
              background: "green",
              borderRadius: "10%",
            }}
          >
            <FaCheckCircle></FaCheckCircle>
          </div>
          <div style={{ fontSize: "250%" }}>Email Verified</div>
        </>
      )}

      {validUrl === 2 && (
        <>
          <div
            style={{
              fontSize: "1000%",
              color: "white",
              background: "red",
              borderRadius: "10%",
            }}
          >
            <FaWindowClose></FaWindowClose>
          </div>
          <div style={{ fontSize: "250%" }}>Email not verified</div>
        </>
      )}

      {validUrl === 4 && (
        <>
          <div
            style={{
              fontSize: "1000%",
              color: "white",
              background: "orange",
              borderRadius: "10%",
            }}
          >
            <FaExclamationCircle></FaExclamationCircle>
          </div>
          <div style={{ fontSize: "250%" }}>
            Your email address has alredy been verified
          </div>
        </>
      )}
      {/* {validUrl === 1 ? (
        <>
          <div
            style={{
              fontSize: "1000%",
              color: "white",
              background: "green",
              borderRadius: "10%",
            }}
          >
            <FaCheckCircle></FaCheckCircle>
          </div>
          <div style={{ fontSize: "250%" }}>Email Verified</div>
        </>
      ) : (
        <>
          <Spinner size="xl" />
          <div style={{ fontSize: "250%" }}>
            Please be patient, your email is getting verified
          </div>
        </>
      )} */}
    </div>
  );
};

export default EmailVerify;
