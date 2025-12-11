/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import AppModal from "./AppModal";
import { DoctorIcon, FileIcon } from "@/icons";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useMutation } from "@apollo/client/react";
import { BULK_IMPORT_DOCTORS } from "@/lib/graphql/mutations";

interface CsvImportDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CsvImportDoctorModal: React.FC<CsvImportDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [importResults, setImportResults] = useState<{
    successfulInvitations: number;
    failedRows: number;
    failedDetails: any[];
  } | null>(null);

  const [bulkImportDoctors, { loading: bulkImportLoading }] = useMutation(
    BULK_IMPORT_DOCTORS,
    {
      onCompleted: (data) => {
        const { successfulInvitations, failedRows, failedDetails } =
          data.bulkImportDoctors;

        setImportResults({
          successfulInvitations,
          failedRows,
          failedDetails,
        });

        if (failedRows > 0) {
          showErrorToast(
            `${successfulInvitations} doctors imported successfully, ${failedRows} failed.`
          );
          // Don't close modal if there are errors - let user see the details
        } else {
          showSuccessToast(
            `${successfulInvitations} doctors imported successfully!`
          );
          onConfirm();
          onClose();
        }
      },
      onError: (error) => {
        showErrorToast(`Bulk import failed: ${error.message}`);
      },
    }
  );

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedCsvFile(file);

    // Clear previous results when new file is selected
    if (file && importResults) {
      setImportResults(null);
    }

    // Validate file type
    if (file && !file.name.toLowerCase().endsWith(".csv")) {
      setErrors({ csvFile: "Please select a valid CSV file" });
      setIsFormValid(false);
    } else {
      setErrors({});
      setIsFormValid(!!file);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCsvFile) {
      setErrors({ csvFile: "Please select a CSV file" });
      return;
    }

    try {
      await bulkImportDoctors({
        variables: {
          csvFile: selectedCsvFile,
        },
      });
    } catch (error) {
      // Error handling is done in the mutation onError callback
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    setSelectedCsvFile(null);
    setErrors({});
    setIsFormValid(false);
    setImportResults(null);
    onClose();
  };

  const downloadSampleCsv = () => {
    const link = document.createElement("a");
    link.href = "/images/doctors_sample.csv";
    link.download = "doctors_sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Doctors"
      onConfirm={handleConfirm}
      confirmLabel={importResults ? "Import Again" : "Import Doctors"}
      icon={<DoctorIcon />}
      size="large"
      outSideClickClose={false}
      confimBtnDisable={!isFormValid || bulkImportLoading}
      onCancel={handleCancel}
      cancelLabel="Cancel"
    >
      <div className="flex flex-col gap-4 md:gap-6 sm:max-h-96 overflow-y-auto">
        {/* Import Results - Show at top when available */}
        {importResults && (
          <div className="space-y-4">
            {/* Summary */}
            <div
              className={`border rounded-lg p-4 ${
                importResults.failedRows > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <h3
                className={`font-medium mb-2 ${
                  importResults.failedRows > 0
                    ? "text-red-900"
                    : "text-green-900"
                }`}
              >
                Import Summary
              </h3>
              <div className="text-sm space-y-1">
                <p
                  className={
                    importResults.failedRows > 0
                      ? "text-red-800"
                      : "text-green-800"
                  }
                >
                  Successful: {importResults.successfulInvitations}
                </p>
                {importResults.failedRows > 0 && (
                  <p className="text-red-800">
                    Failed: {importResults.failedRows}
                  </p>
                )}
              </div>
            </div>

            {/* Failed Details */}
            {importResults.failedRows > 0 &&
              importResults.failedDetails.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3">
                    Failed Imports Details
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {importResults.failedDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="bg-white border border-red-200 rounded p-3 text-xs"
                      >
                        <div className="font-medium text-red-800 mb-1">
                          Row {detail.rowNumber}:{" "}
                          {detail.data?.email ||
                            detail.data?.full_name ||
                            "Unknown"}
                        </div>
                        <div className="text-red-700">
                          {Array.isArray(detail.errors)
                            ? detail.errors.join(", ")
                            : detail.errors || "Unknown error"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Instructions - Only show when no results */}
        {!importResults && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              CSV Import Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • CSV file must contain columns: email, full_name, phone_no,
                medical_license, specialty, status
              </li>
              <li>
                • Status values should be either &quot;ACTIVE&quot; or
                &quot;INACTIVE&quot;
              </li>
              <li>
                • Phone numbers should include country code (e.g., +1234567890)
              </li>
              <li>• Email addresses must be valid</li>
              <li>• Download the sample CSV file below for reference</li>
            </ul>
          </div>
        )}

        {/* Sample CSV Download */}
        <div className="flex items-center flex-col gap-4 sm:flex-row justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start  gap-3">
            <div className="flex items-start gap-2">
              <span className="rounded-lg w-10 h-10 mt-2 flex items-center justify-center border border-primary bg-white shrink-0">
                <FileIcon fill="#2862A9" />
              </span>
              <div>
                <p className="font-medium text-gray-900">Sample CSV File</p>
                <p className="text-sm text-gray-600">
                  Download the template to see the correct format
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={downloadSampleCsv}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Download Sample
          </button>
        </div>

        {/* File Upload - Always show */}
        <div>
          <label className="mb-2 font-medium text-gray-700 text-sm block">
            Select CSV File
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          {errors.csvFile && (
            <p className="text-red-500 text-xs mt-1">{errors.csvFile}</p>
          )}
          {selectedCsvFile && (
            <p className="text-green-600 text-xs mt-1">
              Selected: {selectedCsvFile.name}
            </p>
          )}
        </div>

        {/* Import Status */}
        {bulkImportLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <p className="text-yellow-800 font-medium">
                Importing doctors...
              </p>
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default CsvImportDoctorModal;
