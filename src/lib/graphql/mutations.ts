import { gql } from "@apollo/client";
import { userpayload } from "./attributes";

export const LOGIN_USER = gql`
  mutation LoginUser(
    $email: String!
    $password: String!
    $rememberMe: Boolean!
    $userType: UserTypeEnum
  ) {
    loginUser(
      input: {
        loginAttributes: {
          userType: $userType
          email: $email
          password: $password
          rememberMe: $rememberMe
        }
      }
    ) {
      otpSent
      message
    }
  }
`;
export const LOGIN_WITH_OTP = gql`
  mutation LoginWithOtp($email: String!, $otp: String!, $rememberMe: Boolean) {
    loginWithOtp(
      input: { otpLoginAttributes: { email: $email, otp: $otp rememberMe: $rememberMe } }
    ) {
      token
      user {
       ${userpayload}
      }
    }
  }
`;
