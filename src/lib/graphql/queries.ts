import { userpayload } from "@/lib/graphql/attributes";
import { gql } from "@apollo/client";

export const ALL_DOCTORS = gql`
  query AllDoctors($status: UserStatusEnum $search: String, $page: Int, $perPage: Int) {
    allDoctors(status: $status, search: $search, page: $page, perPage: $perPage) {
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
  query allPatients($status: UserStatusEnum $search: String, $page: Int, $perPage: Int) {
    allPatients(status: $status, search: $search, page: $page, perPage: $perPage) {
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
