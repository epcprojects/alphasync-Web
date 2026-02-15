"use client";

import React from "react";
import { FieldArray, ErrorMessage } from "formik";
import { ThemeDropDown, ThemeInput } from "@/app/components";
import { PlusIcon, TrashBinIcon } from "@/icons";

type Option = { label: string; value: string };

export type MedicalLicenseItem = {
  deaLicense: string;
  states: string;
  expirationDate: string;
  licenseDocument: File | null;
};

type Props = {
  values: any; // Formik values
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  States: Option[];
};

const emptyLicense = (): MedicalLicenseItem => ({
  deaLicense: "",
  states: "",
  expirationDate: "",
  licenseDocument: null,
});

const MedicalLicensesSection: React.FC<Props> = ({
  values,
  handleChange,
  setFieldValue,
  States,
}) => {
  const list: MedicalLicenseItem[] = values.medicalLicenses ?? [emptyLicense()];

  return (
    <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
      <div className="col-span-12 md:col-span-4 lg:col-span-3">
        <label className="text-xs md:text-sm text-gray-700 font-semibold">
          Medical Licenses
        </label>
      </div>

      <div className="col-span-12 space-y-5 md:col-span-8 lg:col-span-8">
        {/* NPI is outside array (single field) */}
        <ThemeInput
          label="NPI Number"
          type="text"
          name="npiNumber"
          value={values.npiNumber}
          onChange={handleChange}
        />
        <ErrorMessage
          name="npiNumber"
          component="div"
          className="text-red-500 text-xs"
        />

        <FieldArray name="medicalLicenses">
          {({ push, remove }) => (
            <>
              {list.map((_, index) => {
                const base = `medicalLicenses.${index}`;
                const canRemove = list.length > 1;

                return (
                  <div
                    key={index}
                    className="bg-gray-100 p-4 flex flex-col gap-4 rounded-xl"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <ThemeInput
                          label="DEA License"
                          type="text"
                          name={`${base}.deaLicense`}
                          className="bg-white"
                          value={values.medicalLicenses?.[index]?.deaLicense || ""}
                          onChange={handleChange}
                        />
                        <ErrorMessage
                          name={`${base}.deaLicense`}
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      <div>
                        <ThemeDropDown
                          label="States"
                          bgClass="bg-white"
                          options={States}
                          value={values.medicalLicenses?.[index]?.states || ""}
                          onChange={(value) => setFieldValue(`${base}.states`, value)}
                        />
                        <ErrorMessage
                          name={`${base}.states`}
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      <div>
                        <ThemeInput
                          label="Expiration Date"
                          type="text"
                          name={`${base}.expirationDate`}
                          className="bg-white"
                          value={
                            values.medicalLicenses?.[index]?.expirationDate || ""
                          }
                          onChange={handleChange}
                        />
                        <ErrorMessage
                          name={`${base}.expirationDate`}
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <ThemeInput
                        label="Upload License Document"
                        type="file"
                        name={`${base}.licenseDocument`}
                        className="bg-white"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          const file = event.currentTarget.files?.[0] ?? null;
                          setFieldValue(`${base}.licenseDocument`, file);
                        }}
                      />
                      <ErrorMessage
                        name={`${base}.licenseDocument`}
                        component="div"
                        className="text-red-500 text-xs"
                      />
                    </div>

                    {canRemove && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="flex gap-1.5 items-center"
                        >
                          <TrashBinIcon />
                          <span className="text-red-500 font-medium">Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => push(emptyLicense())}
                className="flex flex-row gap-1.5 items-center"
              >
                <PlusIcon fill="#2862A9" />
                <span className="text-primary font-medium">Add New</span>
              </button>
            </>
          )}
        </FieldArray>
      </div>
    </div>
  );
};

export default MedicalLicensesSection;
