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
export const UPDATE_DOCTOR = gql`
  mutation UpdateUser(
    $email: String
    $fullName: String
    $phoneNo: String
    $image: Upload
    $medicalLicense: String
    $specialty: String
  ) {
    updateUser(
      input: {
        userAttributes: {
          email: $email
          fullName: $fullName
          phoneNo: $phoneNo
          image: $image
          medicalLicense: $medicalLicense
          specialty: $specialty
        }
      }
    ) {
      user {
        ${userpayload}
      }
    }
  }
`;
export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword(
    $currentPassword: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    updatePassword(
      input: {
        currentPassword: $currentPassword
        password: $password
        passwordConfirmation: $passwordConfirmation
      }
    ) {
      response
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateInvitation(
    $fullName: String
    $email: String
    $phoneNo: String
    $dateOfBirth: ISO8601Date
    $emergencyContactName: String
    $emergencyContactPhone: String
    $medicalHistory: String
    $knownAllergies: String
    $currentMedications: String
    $additionalNotes: String
    $address: String
    $userType: UserTypeEnum
  ) {
    createInvitation(
      input: {
        invitationAttributes: {
          fullName: $fullName
          email: $email
          phoneNo: $phoneNo
          dateOfBirth: $dateOfBirth
          emergencyContactName: $emergencyContactName
          emergencyContactPhone: $emergencyContactPhone
          medicalHistory: $medicalHistory
          knownAllergies: $knownAllergies
          currentMedications: $currentMedications
          additionalNotes: $additionalNotes
          address: $address
          userType: $userType
        }
      }
    ) {
      id
    }
  }
`;
export const SEND_OTP = gql`
  mutation SendOtp($email: String!) {
    sendOtp(input: { sendOtpAttributes: { email: $email } }) {
      message
    }
  }
`;
export const SET_PASSWORD = gql`
  mutation SetPassword(
    $resetPassword: Boolean
    $token: String!
    $password: String
    $passwordConfirmation: String
  ) {
    setPassword(
      input: {
        setPasswordAttributes: {
          resetPassword: $resetPassword
          token: $token
          password: $password
          passwordConfirmation: $passwordConfirmation
        }
      }
    )
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $orderItems: [OrderItemAttributes!]!
    $totalPrice: Float!
    $patientId: ID!
  ) {
    createOrder(
      input: {
        orderAttributes: {
          orderItems: $orderItems
          totalPrice: $totalPrice
          patientId: $patientId
        }
      }
    ) {
      order {
        id
      }
    }
  }
`;

export const UPDATE_CUSTOMER_PROFILE = gql`
  mutation UpdateCustomerProfile(
    $fullName: String
    $phoneNo: String
    $email: String
    $dateOfBirth: ISO8601Date
    $address: String
    $emergencyContactName: String
    $emergencyContactPhone: String
    $medicalHistory: String
    $knownAllergies: String
    $currentMedications: String
    $additionalNotes: String
    $image: Upload
  ) {
    updateUser(
      input: {
        userAttributes: {
          fullName: $fullName
          phoneNo: $phoneNo
          email: $email
          dateOfBirth: $dateOfBirth
          address: $address
          emergencyContactName: $emergencyContactName
          emergencyContactPhone: $emergencyContactPhone
          medicalHistory: $medicalHistory
          knownAllergies: $knownAllergies
          currentMedications: $currentMedications
          additionalNotes: $additionalNotes
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
export const TOGGLE_FAVOURITE = gql`
  mutation ToggleFavorite($productId: ID!) {
    toggleFavorite(input: { productId: $productId }) {
      isFavorited
    }
  }
`;
export const REMOVE_IMAGE = gql`
  mutation RemoveImage($id: ID, $removeImage: Boolean!) {
    removeImage(input: { id: $id, removeImage: $removeImage }) {
      user {
        ${userpayload}
      }
    }
  }
`;
export const CREATE_CHAT = gql`
  mutation CreateChat($participantId: ID!) {
    createChat(input: { participantId: $participantId }) {
      chat {
        id
      }
    }
  }
`;
export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!) {
    sendMessage(
      input: { chatId: $chatId, content: $content, messageType: TEXT }
    ) {
      success
    }
  }
`;
export const BULK_IMPORT_DOCTORS = gql`
  mutation BulkImportDoctors($csvFile: Upload!) {
    bulkImportDoctors(input: { csvFile: $csvFile }) {
      failedDetails {
        data
        errors
        rowNumber
      }
      totalProcessed
      successfulInvitations
      failedRows
    }
  }
`;
