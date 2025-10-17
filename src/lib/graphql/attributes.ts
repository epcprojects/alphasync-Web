export const userpayload = `
        createdAt
        deleted
        email
        fullName
        specialty
        id
        imageUrl
        lastSignInAt
        medicalLicense
        phoneNo
        rememberMe
        revokeAccess
        status
        userType
`;

export interface UserAttributes {
  createdAt?: string;
  deleted?: boolean;
  email?: string;
  fullName?: string;
  id?: number | string;
  imageUrl?: string;
  specialty?: string;
  lastSignInAt?: string;
  medicalLicense?: string;
  phoneNo?: string;
  rememberMe?: boolean;
  revokeAccess?: boolean;
  status?: string;
  userType?: string;
}
