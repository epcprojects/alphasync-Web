import {
  PdfIcon,
  FileDownloadIcon,
  EyeViewIcon,
  TickIcon,
  CrossIcon,
} from "@/icons";
import { Button } from "@headlessui/react";
import React from "react";
export type itemsArray = {
  deaLicenseText: string;
  stateText: string;
  expirationDateText: string;
  documentName: string;
  documentSize: string;
  buttonsState: "approved" | "disapproved" | "pending";
  documentFormat: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  ondownload?: () => void;
  onView?: () => void;
};
type Props = {
  licenseItemsArray: itemsArray;
};

const DoctorProfileLicensesCard = ({ licenseItemsArray }: Props) => {
  return (
    <div className="p-3 lg:p-4 bg-gray-50 flex flex-col gap-4 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="">
          <p className="text-gray-500 text-sm">DEA License</p>
          <p className="text-gray-800 font-medium text-sm">
            {licenseItemsArray.deaLicenseText}
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-gray-500 text-sm">State</p>
          <p className="text-gray-800 font-medium text-sm">
            {licenseItemsArray.stateText}
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-gray-500 text-sm">Expiration Date</p>
          <p className="text-gray-800 font-medium text-sm">
            {licenseItemsArray.expirationDateText}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-end gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm">License Document</p>
          <div className="bg-white flex flex-row justify-between items-center gap-3 border border-mercury p-4 rounded-xl">
            <div className="flex flex-row  gap-3">
              {licenseItemsArray.documentFormat === "pdf" && <PdfIcon />}

              <div className="flex flex-col items-start">
                <p className="text-gravel text-sm font-medium">
                  {licenseItemsArray.documentName}
                </p>
                <p className="text-sm text-vampire-gray">
                  {licenseItemsArray.documentSize}
                </p>
              </div>
            </div>
            <div>
              <Button
                className="p-1.5 cursor-pointer"
                onClick={() =>
                  licenseItemsArray.ondownload && licenseItemsArray.ondownload()
                }
              >
                <FileDownloadIcon />
              </Button>
              <Button
                className="p-1.5 cursor-pointer"
                onClick={() =>
                  licenseItemsArray.onView && licenseItemsArray.onView()
                }
              >
                <EyeViewIcon />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 justify-end">
          <Button
            className={
              licenseItemsArray.buttonsState === "pending" ||
              licenseItemsArray.buttonsState === "approved"
                ? `bg-green-500 min-w-39 text-white py-2.5 cursor-pointer px-6 flex flex-row items-center justify-center gap-3  rounded-full
                `
                : `bg-red-500 min-w-39 text-white py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full`
            }
            onClick={() =>
              licenseItemsArray.onConfirm && licenseItemsArray.onConfirm()
            }
          >
            {licenseItemsArray.buttonsState === "pending" ? (
              <>
                <TickIcon /> <p className="text-sm font-semibold">Approve</p>
              </>
            ) : licenseItemsArray.buttonsState === "approved" ? (
              <>
                <TickIcon /> <p className="text-sm font-semibold">Approved</p>
              </>
            ) : (
              <>
                <CrossIcon fill="white" />
                <p className="text-sm font-semibold">Disapproved</p>
              </>
            )}
          </Button>

          <Button
            className={
              licenseItemsArray.buttonsState === "pending"
                ? `bg-red-500 min-w-39 text-white py-2.5 px-6 cursor-pointer flex flex-row items-center justify-center gap-3  rounded-full`
                : `border border-gray-300 bg-white min-w-39 text-gray-700 py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full`
            }
            onClick={() =>
              licenseItemsArray.onCancel && licenseItemsArray.onCancel()
            }
          >
            {licenseItemsArray.buttonsState === "pending" ? (
              <>
                <CrossIcon fill="white" />
                <p className="text-sm font-semibold">Disapprove</p>
              </>
            ) : (
              <p className="text-sm font-semibold">Reset</p>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileLicensesCard;
