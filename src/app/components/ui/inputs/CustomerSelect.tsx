"use client";
import React, { useState } from "react";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import { useQuery } from "@apollo/client/react";
import { ALL_PATIENTS } from "@/lib/graphql/queries";
import { UserAttributes } from "@/lib/graphql/attributes";

interface CustomerDropdownItem {
  name: string;
  displayName: string;
  email: string;
  id: string;
}

interface CustomerSelectProps {
  selectedCustomer: string;
  setSelectedCustomer: (customer: string) => void;
  errors?: string;
  touched?: boolean;
  disabled?: boolean;
  onCustomerChange?: (customer: CustomerDropdownItem | null) => void;
  placeholder?: string;
  required?: boolean;
  showLabel?: boolean;
  paddingClasses?: string;
  optionPaddingClasses?: string;
}

// Interface for GraphQL response
interface AllPatientsResponse {
  allPatients: {
    allData: UserAttributes[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  selectedCustomer,
  setSelectedCustomer,
  errors = "",
  touched = false,
  disabled = false,
  onCustomerChange,
  placeholder,
  required = true,
  showLabel = true,
  paddingClasses = "py-2.5 h-11 px-2",
  optionPaddingClasses = "p-1",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // GraphQL query to fetch customers
  const {
    data: customersData,
    loading: customersLoading,
    error: customersError,
  } = useQuery<AllPatientsResponse>(ALL_PATIENTS, {
    variables: {
      search: "",
      status: null, // Only fetch active customers
      page: 1,
      perPage: 200, // Fetch more customers for dropdown
    },
    fetchPolicy: "network-only",
  });

  // Transform GraphQL customer data to match dropdown format
  const customers: CustomerDropdownItem[] =
    customersData?.allPatients.allData?.map((patient: UserAttributes) => ({
      name: patient.fullName || patient.email || `Patient ${patient.id}`,
      displayName: patient.fullName || patient.email || `Patient ${patient.id}`,
      email: patient.email || "",
      id: patient.id?.toString() || "",
    })) || [];

  const handleCustomerChange = (val: string | string[]) => {
    const customerName = Array.isArray(val) ? val[0] : val;
    setSelectedCustomer(customerName);

    // Find the selected customer and call the callback
    if (onCustomerChange) {
      const selectedCustomerData = customers.find(
        (c) => c.name === customerName
      );
      onCustomerChange(selectedCustomerData || null);
    }
  };

  const defaultPlaceholder = customersLoading
    ? "Loading customers..."
    : customers.length === 0
    ? "No customers available"
    : "Select a customer";

  return (
    <div>
      {customersError && (
        <p className="text-red-500 text-xs mb-2">
          Error loading customers: {customersError.message}
        </p>
      )}
      <SelectGroupDropdown
        selectedGroup={selectedCustomer}
        setSelectedGroup={handleCustomerChange}
        groups={customers}
        errors={errors}
        name="Customer:"
        multiple={false}
        placeholder={placeholder || defaultPlaceholder}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isShowDrop={!customersLoading && !disabled}
        required={required}
        paddingClasses={paddingClasses}
        optionPaddingClasses={optionPaddingClasses}
        showLabel={showLabel}
        showIcon={false}
        disabled={disabled || customersLoading}
      />
      {errors && touched && <p className="text-red-500 text-xs">{errors}</p>}
    </div>
  );
};

export default CustomerSelect;
