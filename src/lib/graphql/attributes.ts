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
        invitationStatus
        addressVerified
       
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
  invitationStatus?: string;
  addressVerified?: boolean;
}

export interface ProductInfo {
  id?: string;
  title?: string;
  description?: string;
  productType?: string;
  vendor?: string;
}

export interface RequestedItem {
  id?: number | string;
  title?: string;
  totalPrice?: string | number;
  price?: string | number;
  product?: ProductInfo;
}

export interface NoteAttributes {
  content?: string;
  notableId?: string;
  notableType?: string;
  author?: UserAttributes;
}

export interface OrderRequestAttributes {
  displayId?: string;
  id?: number | string;
  status?: string;
  doctorMessage?: string;
  reason?: string;
  doctor?: UserAttributes;
  patient?: UserAttributes;
  requestedItems?: RequestedItem[];
  notes?: NoteAttributes[];
}
