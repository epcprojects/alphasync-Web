import { userpayload } from "@/lib/graphql/attributes";
import { gql } from "@apollo/client";

export const ALL_DOCTORS = gql`
  query AllDoctors($pendingInvites: Boolean, $status: UserStatusEnum $search: String, $page: Int, $perPage: Int) {
    allDoctors(pendingInvites: $pendingInvites, status: $status, search: $search, page: $page, perPage: $perPage) {
      allData {
       ${userpayload}
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;

export const FETCH_USER = gql`
  query FetchUser {
    fetchUser {
      user {
        ${userpayload}
      }
    }
  }
`;
export const ALL_PATIENTS = gql`
  query allPatients($pendingInvites: Boolean,$status: UserStatusEnum $search: String, $page: Int, $perPage: Int) {
    allPatients(pendingInvites: $pendingInvites, status: $status, search: $search, page: $page, perPage: $perPage) {
      allData {
       ${userpayload}
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;
export const ALL_PRODUCTS = gql`
  query AllProducts {
    allProducts(inStockOnly: true) {
      allData {
        id
        title
        variants {
          price
          id
          shopifyVariantId
        }
      }
    }
  }
`;
export const ALL_PRODUCTS_INVENTORY = gql`
  query AllProducts($search: String, $page: Int, $perPage: Int) {
    allProducts(search: $search, page: $page, perPage: $perPage) {
      allData {
        customPrice
        description
        handle
        id
        images
        inStock
        isFavorited
        priceRange
        primaryImage
        productType
        shopifyId
        title
        totalInventory
        vendor
        variants {
          price
          id
          shopifyVariantId
        }
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;
export const DOCTOR_ORDERS = gql`
  query DoctorOrders($status: String, $page: Int, $perPage: Int) {
    doctorOrders(status: $status, page: $page, perPage: $perPage) {
      allData {
        id
        patient {
         ${userpayload}
        }
        createdAt
        status
        orderItems {
          id
          quantity
          price
          product {
            title
          }
        }
        totalPrice
        subtotalPrice
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;
export const FETCH_CUSTOMER = gql`
  query FetchUser($id: ID!) {
    fetchUser(id: $id) {
      user {
        ${userpayload}
      }
    }
  }
`;

export const FETCH_ORDER = gql`
  query FetchOrder($id: ID!) {
    fetchOrder(id: $id) {
      id
      createdAt
      status
      subtotalPrice
      totalPrice
      totalTax
      patient {
        ${userpayload}
      }
      orderItems {
        id
        quantity
        price
        totalPrice
        product {
          id
          title
          variants {
            id
            price
            shopifyVariantId
          }
        }
      }
    }
  }
`;
export const FETCH_PRODUCT = gql`
  query FetchProduct($id: ID!) {
    fetchProduct(id: $id) {
      customPrice
      description
      handle
      id
      images
      inStock
      isFavorited
      priceRange
      primaryImage
      productType
      shopifyId
      title
      totalInventory
      vendor
      variants {
        price
        id
        shopifyVariantId
      }
    }
  }
`;
export const FETCH_ALL_MESSAGES = gql`
query FetchAllMessages($chatId: ID!) {
    fetchAllMessages(chatId: $chatId) {
        allData {
            content
            id
            chat {
            id
            otherParticipant {
                ${userpayload}
            }
            }
            user {
                ${userpayload}
            }
        }
    }
}
`;
export const FETCH_DOCTOR = gql`
  query FetchUser($status: String, $page: Int, $perPage: Int) {
    fetchUser(status: $status, page: $page, perPage: $perPage) {
      user {
        doctor {
          id
          fullName
          specialty
        }
      }
    }
  }
`;
export const MESSAGE_ADDED = gql`
  subscription MessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      __typename
      content
      id
      messageType
      user {
        __typename
        ${userpayload}
      }
      sender {
        __typename
        ${userpayload}
      }
    }
  }
`;

export const PATIENT_ORDERS = gql`
query PatientOrders($patientId: ID, $page: Int, $perPage: Int) {
  patientOrders(patientId: $patientId, page: $page, perPage: $perPage) {
      allData {
          id
          status
          createdAt
          totalPrice
      }
      count
      nextPage
      prevPage
      totalPages
  }
}
`;