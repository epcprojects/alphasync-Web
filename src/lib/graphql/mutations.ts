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
      input: { otpLoginAttributes: { email: $email, otp: $otp, rememberMe: $rememberMe } }
    ) {
      token
      user {
       ${userpayload}
      }
    }
  }
`;

export const CREATE_INVITATION = gql`
  mutation CreateInvitation(
    $email: String
    $fullName: String
    $userType: UserTypeEnum
    $phoneNo: String
    $medicalLicense: String
    $status: UserStatusEnum
    $specialty: String
    $image: Upload
  ) {
    createInvitation(
      input: {
        invitationAttributes: {
          email: $email
          specialty: $specialty
          fullName: $fullName
          image: $image
          userType: $userType
          phoneNo: $phoneNo
          medicalLicense: $medicalLicense
          status: $status
        }
      }
    ) {
      id
    }
  }
`;
export const RESEND_OTP = gql`
  mutation ResendOtp($email: String!) {
    resendOtp(input: { resendOtpAttributes: { email: $email } }) {
      message
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID
    $email: String
    $fullName: String
    $userType: UserTypeEnum
    $phoneNo: String
    $medicalLicense: String
    $status: UserStatusEnum
    $specialty: String
    $image: Upload
  ) {
    updateUser(
      input: {
        id: $id
        userAttributes: {
          email: $email
          specialty: $specialty
          fullName: $fullName
          image: $image
          userType: $userType
          phoneNo: $phoneNo
          medicalLicense: $medicalLicense
          status: $status
        }
      }
    ) {
      user {
        id
      }
    }
  }
`;

export const MODIFY_ACCESSS_USER = gql`
  mutation ModifyAccessUser($userId: ID!, $revokeAccess: Boolean!) {
    modifyAccessUser(
      input: {
        accessAttributes: { userId: $userId, revokeAccess: $revokeAccess }
      }
    ) {
      message
    }
  }
`;
export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation(
    $token: String!
    $password: String
    $passwordConfirmation: String
  ) {
    acceptInvitation(
      input: {
        setPasswordAttributes: {
          token: $token
          password: $password
          passwordConfirmation: $passwordConfirmation
        }
      }
    ) {
      token
    }
  }
`;
export const SEND_PASSWORD_INSTRUCTIONS = gql`
  mutation SendResetPasswordInstructions($email: String!) {
    sendResetPasswordInstructions(input: { email: $email })
  }
`;

export const UPDATE_ADMIN = gql`
  mutation UpdateUser(
    $email: String
    $password: String
    $passwordConfirmation: String
    $fullName: String
    $phoneNo: String
    $image: Upload
  ) {
    updateUser(
      input: {
        userAttributes: {
          email: $email
          password: $password
          passwordConfirmation: $passwordConfirmation
          fullName: $fullName
          phoneNo: $phoneNo
          image: $image
        }
      }
    ) {
      user {
        ${userpayload}
      }
    }
  }
`;
