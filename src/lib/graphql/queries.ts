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
