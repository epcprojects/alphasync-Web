import {
  PdfIcon,
  FileDownloadIcon,
  EyeViewIcon,
  TickIcon,
  CrossIcon,
} from "@/icons";
import { Button } from "@headlessui/react";
import React from "react";
type Props = {
  deaLicenseText: string;
  stateText: string;
  expirationDateText: string;
  documentFormat: string;
  buttonsState: "approved" | "disapproved" | "pending";
  documentName: string;
  documentSize: string;
  onApprove?: () => void;
  onDisapprove?: () => void;
};

const DoctorProfileLicensesCard = ({
  deaLicenseText,
  stateText,
  expirationDateText,
  documentName,
  documentSize,
  buttonsState,
  onApprove,
  onDisapprove,
  documentFormat,
}: Props) => {
  return (
    <div className="p-3 lg:p-4 bg-gray-50 flex flex-col gap-4 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="">
          <p className="text-gray-500 text-sm">DEA License</p>
          <p className="text-gray-800 font-medium text-sm">{deaLicenseText}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-gray-500 text-sm">State</p>
          <p className="text-gray-800 font-medium text-sm">{stateText}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-gray-500 text-sm">Expiration Date</p>
          <p className="text-gray-800 font-medium text-sm">
            {expirationDateText}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-end gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm">License Document</p>
          <div className="bg-white flex flex-row justify-between items-center gap-3 border border-mercury p-4 rounded-xl">
            <div className="flex flex-row  gap-3">
              {documentFormat === "pdf" && <PdfIcon />}

              <div className="flex flex-col items-start">
                <p className="text-gravel text-sm font-medium">
                  {documentName}
                </p>
                <p className="text-sm text-vampire-gray">{documentSize}</p>
              </div>
            </div>
            <div>
              <Button className="p-1.5">
                <FileDownloadIcon />
              </Button>
              <Button className="p-1.5">
                <EyeViewIcon />
              </Button>
            </div>
          </div>
        </div>
        {buttonsState === "pending" && (
          <div className="flex flex-col lg:flex-row gap-4 justify-end">
            <Button
              className="bg-green-500 min-w-39 text-white py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full"
              onClick={() => onApprove && onApprove()}
            >
              <TickIcon />
              <p className="text-sm font-semibold">Approve</p>
            </Button>
            <Button
              className="bg-red-500 min-w-39 text-white py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full"
              onClick={() => onDisapprove && onDisapprove()}
            >
              <CrossIcon fill="white" />
              <p className="text-sm font-semibold">Disapprove</p>
            </Button>
          </div>
        )}
        {buttonsState === "approved" && (
          <div className="flex  flex-col lg:flex-row gap-4 justify-end">
            <Button className="bg-green-500 min-w-39 text-white py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full">
              <TickIcon />
              <p className="text-sm font-semibold">Approved</p>
            </Button>
            <Button className="border border-gray-300 bg-white min-w-39 text-gray-700 py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full">
              <p className="text-sm font-semibold">Reset</p>
            </Button>
          </div>
        )}
        {buttonsState === "disapproved" && (
          <div className="flex  flex-col lg:flex-row gap-4 justify-end">
            <Button className="bg-red-500 min-w-39 text-white py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full">
              <CrossIcon fill="white" />
              <p className="text-sm font-semibold">Disapproved</p>
            </Button>
            <Button className="border border-gray-300 bg-white min-w-39 text-gray-700 py-2.5 px-6 flex flex-row items-center justify-center gap-3  rounded-full">
              <p className="text-sm font-semibold">Reset</p>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileLicensesCard;
