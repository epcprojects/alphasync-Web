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
      token
      user {
        ${userpayload}
      }
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
    $firstName: String
    $lastName: String
    $userType: UserTypeEnum
    $phoneNo: String
    $medicalLicense: String
    $status: UserStatusEnum
    $specialty: String
    $image: Upload
    $street1: String
    $street2: String
    $city: String
    $state: String
    $postalCode: String
    $address: String
    $clinic: String
  ) {
    createInvitation(
      input: {
        invitationAttributes: {
          email: $email
          specialty: $specialty
          firstName: $firstName
          lastName: $lastName
          image: $image
          userType: $userType
          phoneNo: $phoneNo
          medicalLicense: $medicalLicense
          status: $status
          street1: $street1
          street2: $street2
          city: $city
          state: $state
          postalCode: $postalCode
          address: $address
          clinic: $clinic
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

export const RESEND_INVITATION = gql`
  mutation ResendInvitation($id: ID!) {
    resendInvitation(input: { id: $id }) {
      id
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID
    $email: String
    $fullName: String
    $firstName: String
    $lastName: String
    $userType: UserTypeEnum
    $phoneNo: String
    $medicalLicense: String
    $status: UserStatusEnum
    $specialty: String
    $clinic: String
    $image: Upload
    $addressVerified: Boolean
    $street1: String
    $street2: String
    $city: String
    $state: String
    $postalCode: String
    $address: String
  ) {
    updateUser(
      input: {
        id: $id
        userAttributes: {
          email: $email
          specialty: $specialty
          clinic: $clinic
          fullName: $fullName
          firstName: $firstName
          lastName: $lastName
          image: $image
          userType: $userType
          phoneNo: $phoneNo
          medicalLicense: $medicalLicense
          status: $status
          addressVerified: $addressVerified
          street1: $street1
          street2: $street2
          city: $city
          state: $state
          postalCode: $postalCode
          address: $address
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
    $firstName: String
    $lastName: String
    $phoneNo: String
    $image: Upload
    $medicalLicense: String
    $specialty: String
    $clinic: String
    $street1: String
    $street2: String
    $city: String
    $state: String
    $postalCode: String
    $address: String
    $sameAsBillingAddress: Boolean
    $shippingCountry: String
    $shippingPostalCode: String
    $shippingState:String
    $shippingCity: String
    $shippingStreet2: String
    $shippingStreet1:String
  ) {
    updateUser(
      input: {
        userAttributes: {
          email: $email
          fullName: $fullName
          firstName: $firstName
          lastName: $lastName
          phoneNo: $phoneNo
          image: $image
          medicalLicense: $medicalLicense
          specialty: $specialty
          clinic: $clinic
          street1: $street1
          street2: $street2
          city: $city
          state: $state
          postalCode: $postalCode
          address: $address
          sameAsBillingAddress: $sameAsBillingAddress
          shippingCountry: $shippingCountry
          shippingPostalCode: $shippingPostalCode
          shippingState: $shippingState
          shippingCity: $shippingCity
          shippingStreet2: $shippingStreet2
          shippingStreet1: $shippingStreet1
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
    $firstName: String
    $lastName: String
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
    $street1: String
    $street2: String
    $city: String
    $state: String
    $postalCode: String
    $country: String
  ) {
    createInvitation(
      input: {
        invitationAttributes: {
          fullName: $fullName
          firstName: $firstName
          lastName: $lastName
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
          street1: $street1
          street2: $street2
          city: $city
          state: $state
          postalCode: $postalCode
          country: $country
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
    $patientId: ID
    $useCustomPricing: Boolean
  ) {
    createOrder(
      input: {
        orderAttributes: {
          orderItems: $orderItems
          totalPrice: $totalPrice
          patientId: $patientId
          useCustomPricing: $useCustomPricing
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
    $firstName: String
    $lastName: String
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
    $street1: String
    $street2: String
    $city: String
    $state: String
    $postalCode: String
    $country: String
    $sameAsBillingAddress: Boolean
    $shippingCountry: String
    $shippingPostalCode: String
    $shippingState:String
    $shippingCity: String
    $shippingStreet2: String
    $shippingStreet1:String
  ) {
    updateUser(
      input: {
        userAttributes: {
          fullName: $fullName
          firstName: $firstName
          lastName: $lastName
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
          street1: $street1
          street2: $street2
          city: $city
          state: $state
          postalCode: $postalCode
          country: $country
          sameAsBillingAddress: $sameAsBillingAddress
          shippingCountry: $shippingCountry
          shippingPostalCode: $shippingPostalCode
          shippingState: $shippingState
          shippingCity: $shippingCity
          shippingStreet2: $shippingStreet2
          shippingStreet1: $shippingStreet1
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

export const SYNC_PRODUCTS = gql`
  mutation SyncProducts($clientMutationId: String) {
    syncProducts(input: { clientMutationId: $clientMutationId }) {
      message
      productsCount
      clientMutationId
    }
  }
`;
export const REQUEST_ORDER = gql`
  mutation RequestOrder(
    $doctorId: ID!
    $reason: String!
    $requestedItems: [OrderItemAttributes!]!
  ) {
    requestOrder(
      input: {
        attributes: {
          doctorId: $doctorId
          reason: $reason
          requestedItems: $requestedItems
        }
      }
    ) {
      orderRequest {
        id
      }
    }
  }
`;

export const APPROVE_ORDER_REQUEST = gql`
  mutation ApproveOrderRequest($requestId: ID!, $doctorMessage: String) {
    approveOrderRequest(
      input: { requestId: $requestId, doctorMessage: $doctorMessage }
    ) {
      invoiceUrl
    }
  }
`;

export const DENY_ORDER_REQUEST = gql`
  mutation DenyOrderRequest($requestId: ID!, $doctorMessage: String!) {
    denyOrderRequest(
      input: { requestId: $requestId, doctorMessage: $doctorMessage }
    ) {
      orderRequest {
        id
      }
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote(
    $notableId: ID!
    $notableType: NotableTypeEnum!
    $content: String!
  ) {
    createNote(
      input: {
        attributes: {
          notableId: $notableId
          notableType: $notableType
          content: $content
        }
      }
    ) {
      note {
        id
      }
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(input: { id: $id }) {
      message
    }
  }
`;
export const EMAIL_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($emailNotification: Boolean) {
    updateNotificationSettings(
      input: { settings: { emailNotification: $emailNotification } }
    ) {
      success
    }
  }
`;
export const SMS_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($smsNotification: Boolean) {
    updateNotificationSettings(
      input: { settings: { smsNotification: $smsNotification } }
    ) {
      success
    }
  }
`;
export const ORDER_UPDATES_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($orderUpdates: Boolean) {
    updateNotificationSettings(
      input: { settings: { orderUpdates: $orderUpdates } }
    ) {
      success
    }
  }
`;
export const LOW_STOCK_ALERTS_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($lowStockAlerts: Boolean) {
    updateNotificationSettings(
      input: { settings: { lowStockAlerts: $lowStockAlerts } }
    ) {
      success
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: ID!) {
    deleteNotification(input: { notificationId: $notificationId }) {
      message
      success
    }
  }
`;
export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead($clientMutationId: String) {
    markAllNotificationsAsRead(input: { clientMutationId: $clientMutationId }) {
      success
      updatedCount
    }
  }
`;
export const UPDATE_USER_ADDRESS_VERIFIED = gql`
  mutation UpdateUserAddressVerified($addressVerified: Boolean) {
    updateUser(
      input: { userAttributes: { addressVerified: $addressVerified } }
    ) {
      user {
        ${userpayload}
      }
    }
  }
`;

export const REORDER_ORDER = gql`
  mutation ReorderOrder($orderId: ID!) {
    reorderOrder(input: { orderId: $orderId }) {
      order {
        id
      }
    }
  }
`;

export const UPDATE_AUTO_REORDER = gql`
  mutation UpdateAutoReorder($orderId: ID!, $autoReorder: Boolean!) {
    updateAutoReorder(input: { orderId: $orderId, autoReorder: $autoReorder }) {
      order {
        id
      }
    }
  }
`;
export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(input: { orderId: $orderId }) {
      order {
        id
      }
    }
  }
`;

export const PROCESS_PAYMENT = gql`
  mutation ProcessPayment(
    $orderId: ID!
    $opaqueData: OpaqueData!
    $amount: Float!
    $totalTax: Float!
    $billingAddress: BillingAddress
    $shippingAddress: ShippingAddress
  ) {
    processPayment(
      input: {
        orderId: $orderId
        opaqueData: $opaqueData
        amount: $amount
        totalTax: $totalTax
        billingAddress: $billingAddress
        shippingAddress: $shippingAddress
      }
    ) {
      success
      transactionId
    }
  }
`;

export const DISABLE_2FA = gql`
  mutation UpdateUser($twoFaEnabled: Boolean) {
    updateUser(input: { userAttributes: { twoFaEnabled: $twoFaEnabled } }) {
      user {
        ${userpayload}
      }
    }
  }
`;
export const UPDATE_PRODUCT_PRICE = gql`
  mutation UpdateProductPrice($productId: ID!, $price: Float!) {
    updateProductPrice(input: { productId: $productId, price: $price }) {
      customPrice
      id
    }
  }
`;

/**
 * Marks a product not for sale: reverts to base price, clears customPrice,
 * and removes it from customer inventory until marked up again.
 */
export const MARK_PRODUCT_NOT_FOR_SALE = gql`
  mutation MarkProductNotForSale($productId: ID!) {
    markProductNotForSale(input: { productId: $productId }) {
      clientMutationId
      deletedCount
      message
      success
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(input: { notificationId: $notificationId }) {
      success
    }
  }
`;

export const BLANKET_MARKUP_PRODUCTS = gql`
  mutation BlanketMarkupProducts($markupPercentage: Float!) {
    blanketMarkupProducts(input: { markupPercentage: $markupPercentage }) {
      success
    }
  }
`;

export const CALCULATE_TAX = gql`
  mutation CalculateTax(
    $clientMutationId: String
    $subtotalPrice: Float!
    $postalCode: String!
  ) {
    calculateTax(
      input: {
        clientMutationId: $clientMutationId
        subtotalPrice: $subtotalPrice
        postalCode: $postalCode
      }
    ) {
      clientMutationId
      success
      taxAmount
      totalPrice
    }
  }
`;

export const EXPORT_PRODUCTS = gql`
  mutation ExportProducts(
    $search: String
    $productType: String
    $category: String
    $inStockOnly: Boolean
    $favoriteProducts: Boolean
    $markedUp: Boolean
    $notMarkedUp: Boolean
    $patientId: ID
  ) {
    exportProducts(
      input: {
        search: $search
        productType: $productType
        category: $category
        inStockOnly: $inStockOnly
        favoriteProducts: $favoriteProducts
        markedUp: $markedUp
        notMarkedUp: $notMarkedUp
        patientId: $patientId
      }
    ) {
      clientMutationId
      csvData
      fileName
    }
  }
`;

export const EXPORT_PATIENTS = gql`
  mutation ExportPatients(
    $status: UserStatusEnum
    $search: String
    $pendingInvites: Boolean
  ) {
    exportPatients(
      input: {
        status: $status
        search: $search
        pendingInvites: $pendingInvites
      }
    ) {
      clientMutationId
      csvData
      fileName
    }
  }
`;

export const EXPORT_ORDER_REQUESTS = gql`
  mutation ExportOrderRequests(
    $status: String
    $patientId: ID
    $search: String
    $reorder: Boolean
  ) {
    exportOrderRequests(
      input: {
        status: $status
        patientId: $patientId
        search: $search
        reorder: $reorder
      }
    ) {
      clientMutationId
      csvData
      fileName
    }
  }
`;

export const EXPORT_ORDERS = gql`
  mutation ExportOrders(
    $status: OrderStatusEnum
    $patientId: ID
    $myClinic: Boolean
  ) {
    exportOrders(
      input: {
        status: $status
        patientId: $patientId
        myClinic: $myClinic
      }
    ) {
      clientMutationId
      csvData
      fileName
    }
  }
`;

export const EXPORT_DOCTORS = gql`
  mutation ExportDoctors($status: UserStatusEnum, $pendingInvites: Boolean, $search: String) {
    exportDoctors(input: { status: $status, pendingInvites: $pendingInvites, search: $search }) {
      csvData
      fileName
    }
  }
`;


export const EXPORT_ADMINS = gql`
  mutation ExportAdmins($status: UserStatusEnum, $pendingInvites: Boolean, $search: String) {
    exportAdmins(input: { status: $status, pendingInvites: $pendingInvites, search: $search }) {
      csvData
      fileName
    }
  }
`;

export const CREATE_VIDEO = gql`
  mutation CreateVideo($title: String!, $videoUrl: String!) {
    createVideo(input: { title: $title, videoUrl: $videoUrl }) {
      success
    }
  }
`;

export const UPDATE_VIDEO = gql`
  mutation UpdateVideo($id: ID!, $title: String, $videoUrl: String, $archived: Boolean) {
    updateVideo(input: { id: $id, title: $title, videoUrl: $videoUrl, archived: $archived }) {
      success
    }
  }
`;

export const MARK_VIDEO_AS_VIEWED = gql`
  mutation MarkVideoAsViewed($videoId: ID!) {
    markVideoAsViewed(input: { videoId: $videoId }) {
      hasViewedAllVideos
      success
    }
  }
`;
