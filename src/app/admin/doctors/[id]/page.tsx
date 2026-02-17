"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { KeyLeftIcon } from "@/icons";
import React from "react";
import { DoctorProfileHeaderCard } from "@/app/components";
import DoctorProfileLicensesCard, {
  itemsArray,
} from "@/app/components/ui/cards/DoctorProfileLicensesCard";

const Page = () => {
  const isMobile = useIsMobile();

  const licenceItemsArray: itemsArray[] = [
    {
      deaLicenseText: "CS4861375",
      stateText: "California",
      expirationDateText: "14-08-2030",
      documentName: "MD-123456.pdf",
      documentSize: "200 KB",
      buttonsState: "pending",
      documentFormat: "pdf",
      onConfirm: () => console.log("Approved"),
      onCancel: () => console.log("Disapproved"),
      ondownload: () => console.log("Downloaded"),
      onView: () => console.log("Viewed"),
    },
    {
      deaLicenseText: "CS4861375",
      stateText: "California",
      expirationDateText: "14-08-2030",
      documentName: "MD-123456.pdf",
      documentSize: "200 KB",
      buttonsState: "approved",
      documentFormat: "pdf",
      onConfirm: () => console.log("Approved"),
      onCancel: () => console.log("Disapproved"),
      ondownload: () => console.log("Downloaded"),
      onView: () => console.log("Viewed"),
    },
    {
      deaLicenseText: "CS4861375",
      stateText: "California",
      expirationDateText: "14-08-2030",
      documentName: "MD-123456.pdf",
      documentSize: "200 KB",
      buttonsState: "disapproved",
      documentFormat: "pdf",
      onConfirm: () => console.log("Approved"),
      onCancel: () => console.log("Disapproved"),
      ondownload: () => console.log("Downloaded"),
      onView: () => console.log("Viewed"),
    },
  ];

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <KeyLeftIcon
              height={isMobile ? "16" : "24"}
              width={isMobile ? "16" : "24"}
            />
          </span>
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
              Doctor Profile
            </h2>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl">
        <DoctorProfileHeaderCard
          name={"John Smitt"}
          email={"john.smith@email.com"}
          phone={"(555) 123-4567"}
          statusActive={true}
          speciality={"Cardiology"}
          npiNumber={"MD123456"}
          dob={"12/09/2003"}
          oneditProfile={() => console.log("on edit")}
          ondeleteProfile={() => console.log("on delete")}
        />

        <div className="p-3 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <p className="text-gray-700 lg:col-span-3 font-semibold">
              Medical Licenses
            </p>
            <div className="flex flex-col lg:col-span-9 gap-5">
              {licenceItemsArray.map((item, index) => (
                <DoctorProfileLicensesCard
                  licenseItemsArray={item}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
