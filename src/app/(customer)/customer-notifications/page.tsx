"use client";
import { NotificationList } from "@/app/components";
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { ALL_NOTIFICATIONS } from "@/lib/graphql/queries";

const Page = () => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);

  const { data, refetch, loading, error } = useQuery(ALL_NOTIFICATIONS, {
    variables: {
      page: currentPage + 1, // GraphQL uses 1-based pagination
      perPage: itemsPerPage,
    },
    fetchPolicy: "network-only",
  });

  const notifications = data?.allNotifications?.allData;
  const pageCount = data?.allNotifications?.totalPages || 1;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  return (
    <NotificationList
      notifications={notifications}
      loading={loading}
      error={error}
      pageCount={pageCount}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      refetch={refetch}
      userType="customer"
    />
  );
};

export default Page;
