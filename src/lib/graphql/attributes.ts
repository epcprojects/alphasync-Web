export const userpayload = `
        createdAt
        deleted
        email
        fullName
        id
        imageUrl
        lastSignInAt
        medicalLicense
        phoneNo
        rememberMe
        revokeAccess
        status
`;

export interface UserAttributes {
  createdAt?: string;
  deleted?: boolean;
  email?: string;
  fullName?: string;
  id?: string;
  imageUrl?: string;
  lastSignInAt?: string;
  medicalLicense?: string;
  phoneNo?: string;
  rememberMe?: boolean;
  revokeAccess?: boolean;
  status?: string;
}
