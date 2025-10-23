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
        emergencyContactName
        emergencyContactPhone
        medicalHistory
        knownAllergies
        currentMedications
        additionalNotes
        address
        userType
        dateOfBirth
        patientOrdersCount
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
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
  knownAllergies?: string;
  currentMedications?: string;
  additionalNotes?: string;
  address?: string;
  userType?: string;
  dateOfBirth?: string;
  patientOrdersCount?: string;
}
