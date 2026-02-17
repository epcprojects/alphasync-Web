"use client";
import {
  AuthHeader,
  GoogleAutocompleteInput,
  ImageUpload,
  MedicalLicensesSection,
  ProfileStepper,
  SelectGroupDropdown,
  ThemeButton,
  ThemeInput,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Switch } from "@headlessui/react";
import React, { useState } from "react";

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Address Info" },
  { id: 3, label: "DEA license" },
];

const specialities = [
  { name: "cardiology", displayName: "Cardiology" },
  { name: "dermatology", displayName: "Dermatology" },
  { name: "neurology", displayName: "Neurology" },
  { name: "orthopedics", displayName: "Orthopedics" },
  { name: "pediatrics", displayName: "Pediatrics" },
  { name: "psychiatry", displayName: "Psychiatry" },
  { name: "gynecology", displayName: "Gynecology" },
  { name: "obstetrics", displayName: "Obstetrics" },
  { name: "oncology", displayName: "Oncology" },
  { name: "radiology", displayName: "Radiology" },
  { name: "urology", displayName: "Urology" },
  { name: "gastroenterology", displayName: "Gastroenterology" },
  { name: "endocrinology", displayName: "Endocrinology" },
  { name: "nephrology", displayName: "Nephrology" },
  { name: "pulmonology", displayName: "Pulmonology" },
  { name: "general_surgery", displayName: "General Surgery" },
  { name: "dentistry", displayName: "Dentistry" },
  { name: "ophthalmology", displayName: "Ophthalmology" },
  { name: "ent", displayName: "ENT (Ear, Nose, Throat)" },
  { name: "rheumatology", displayName: "Rheumatology" },
  { name: "family_medicine", displayName: "Family Medicine" },
  { name: "internal_medicine", displayName: "Internal Medicine" },
  { name: "anesthesiology", displayName: "Anesthesiology" },
  { name: "pathology", displayName: "Pathology" },
  { name: "hematology", displayName: "Hematology" },
  { name: "allergy_immunology", displayName: "Allergy & Immunology" },
  { name: "infectious_disease", displayName: "Infectious Disease" },
  { name: "plastic_surgery", displayName: "Plastic Surgery" },
  { name: "vascular_surgery", displayName: "Vascular Surgery" },
  { name: "thoracic_surgery", displayName: "Thoracic Surgery" },
  { name: "colorectal_surgery", displayName: "Colorectal Surgery" },
  { name: "neurosurgery", displayName: "Neurosurgery" },
  { name: "emergency_medicine", displayName: "Emergency Medicine" },
  { name: "sports_medicine", displayName: "Sports Medicine" },
  { name: "geriatrics", displayName: "Geriatrics" },
  { name: "palliative_medicine", displayName: "Palliative Medicine" },
  { name: "pain_management", displayName: "Pain Management" },
  { name: "sleep_medicine", displayName: "Sleep Medicine" },
  { name: "nuclear_medicine", displayName: "Nuclear Medicine" },
  {
    name: "reproductive_endocrinology",
    displayName: "Reproductive Endocrinology",
  },
  { name: "neonatology", displayName: "Neonatology" },
  { name: "medical_genetics", displayName: "Medical Genetics" },
  { name: "addiction_medicine", displayName: "Addiction Medicine" },
  { name: "occupational_medicine", displayName: "Occupational Medicine" },
  { name: "preventive_medicine", displayName: "Preventive Medicine" },
  { name: "critical_care", displayName: "Critical Care Medicine" },
  { name: "trauma_surgery", displayName: "Trauma Surgery" },
  { name: "bariatric_surgery", displayName: "Bariatric Surgery" },
  { name: "hand_surgery", displayName: "Hand Surgery" },
  { name: "foot_ankle_surgery", displayName: "Foot & Ankle Surgery" },
  { name: "maxillofacial_surgery", displayName: "Maxillofacial Surgery" },
  { name: "otolaryngology", displayName: "Otolaryngology" },
  { name: "phlebology", displayName: "Phlebology" },
  { name: "cosmetic_surgery", displayName: "Cosmetic Surgery" },
  { name: "dermatopathology", displayName: "Dermatopathology" },
  {
    name: "interventional_radiology",
    displayName: "Interventional Radiology",
  },
  { name: "maternal_fetal_medicine", displayName: "Maternal–Fetal Medicine" },
  { name: "pediatric_surgery", displayName: "Pediatric Surgery" },
  { name: "pediatric_cardiology", displayName: "Pediatric Cardiology" },
  { name: "pediatric_neurology", displayName: "Pediatric Neurology" },
  { name: "pediatric_endocrinology", displayName: "Pediatric Endocrinology" },
  { name: "pediatric_nephrology", displayName: "Pediatric Nephrology" },
  { name: "pediatric_oncology", displayName: "Pediatric Oncology" },
  {
    name: "pediatric_gastroenterology",
    displayName: "Pediatric Gastroenterology",
  },
  { name: "pulmonary_critical_care", displayName: "Pulmonary Critical Care" },
  { name: "cardiothoracic_surgery", displayName: "Cardiothoracic Surgery" },
  { name: "chiropractic_medicine", displayName: "Chiropractic Medicine" },
  {
    name: "speech_language_therapy",
    displayName: "Speech & Language Therapy",
  },
  { name: "physiotherapy", displayName: "Physiotherapy" },
];

const Page = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const isMobile = useIsMobile();

  const handleGroupSelect = (user: string | string[]) => {
    const userSelected = Array.isArray(user) ? user[0] : user;
    setSelectedUser(userSelected);
  };
  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };
  return (
    <div className="relative flex flex-col items-center justify-start pt-23 h-screen">
      <AuthHeader logo={Images.auth.logo} title="" />
      <div className="w-full  flex flex-col items-center justify-center space-y-3">
        <div className=" block w-full max-w-md">
          <ProfileStepper activeStep={currentStep} steps={steps} />
        </div>

        {currentStep === 1 && (
          <div className="mt-8 flex flex-col gap-4 w-full max-w-md">
            <span className="block -mb-2 text-sm text-gray-700 font-medium text-start">
              Your profile photo <span className="text-red-500"> *</span>
            </span>
            <ImageUpload
              imageUrl={undefined}
              onChange={handleImageChange}
              placeholder="/images/arinaProfile.png"
              showTitle={false}
              roundedClass="rounded-lg"
              width={isMobile ? 72 : 120}
              height={isMobile ? 72 : 120}
              className="border-b-0"
              showUpdateBtn={false}
            />

            <div className="grid grid-cols-1 gap-4">
              <div className="w-full">
                <ThemeInput
                  required
                  label="Phone Number"
                  placeholder="(316) 555-0116"
                  name="phoneNo"
                  error={false}
                  errorMessage={"Please enter your phone nuMBER"}
                  id="phoneNo"
                  onChange={(e) => {}}
                  type="tel"
                  value={""}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="w-full">
                <ThemeInput
                  required
                  label="Clinic"
                  placeholder="Enter clinic name"
                  name="clinic"
                  error={false}
                  errorMessage={"Please enter your phone nuMBER"}
                  id="phoneNo"
                  onChange={(e) => {}}
                  type="tel"
                  value={""}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="w-full">
                <SelectGroupDropdown
                  selectedGroup={selectedUser}
                  setSelectedGroup={handleGroupSelect}
                  groups={specialities}
                  name="Specialty"
                  multiple={false}
                  placeholder="Select specialty"
                  searchTerm={specialtySearchTerm}
                  setSearchTerm={setSpecialtySearchTerm}
                  isShowDrop={true}
                  required
                  paddingClasses="py-2.5 px-3"
                  optionPaddingClasses="p-1"
                  showLabel={true}
                />
                {/* {errors.specialty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.specialty}
                  </p>
                )} */}
              </div>

              <div className="w-full">
                <ThemeInput
                  required
                  label="NPI number"
                  placeholder="Enter license number"
                  name="npiNumber"
                  error={false}
                  errorMessage={"Please enter your NPI number"}
                  id="npiNumber"
                  onChange={(e) => {}}
                  type="text"
                  value={""}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="mt-8 flex flex-col gap-4 w-full max-w-md">
            <div className="grid grid-cols-1 gap-4">
              <div className="w-full">
                <GoogleAutocompleteInput
                  required
                  label="Street Address"
                  placeholder="Enter street address"
                  name="street1"
                  // error={!!errors.street1}
                  // errorMessage={errors.street1}
                  id="street1"
                  value={""}
                  onChange={(value) => {}}
                  onAddressSelect={(address) => {
                    // Auto-fill address fields when address is selected
                    // setFormData((prev) => ({
                    //   ...prev,
                    //   street1: address.street1,
                    //   city: address.city,
                    //   state: address.state,
                    //   postalCode: address.postalCode,
                    // }));
                  }}
                />
              </div>

              <div className="w-full">
                <ThemeInput
                  required
                  label="Street Address 2 (Optional)"
                  placeholder="Apartment, suite, etc. (optional)"
                  name="street2"
                  error={false}
                  errorMessage={"Please enter your phone nuMBER"}
                  id="phoneNo"
                  onChange={(e) => {}}
                  type="tel"
                  value={""}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="w-full">
                <ThemeInput
                  required
                  label="City"
                  placeholder="Enter city"
                  name="city"
                  error={false}
                  errorMessage={"Please enter your NPI number"}
                  id="npiNumber"
                  onChange={(e) => {}}
                  type="text"
                  value={""}
                />
              </div>

              <div className="w-full">
                <ThemeInput
                  required
                  label="State"
                  placeholder="Enter state"
                  name="state"
                  error={false}
                  errorMessage={"Please enter your NPI number"}
                  id="npiNumber"
                  onChange={(e) => {}}
                  type="text"
                  value={""}
                />
              </div>

              <div className="w-full">
                <ThemeInput
                  required
                  label="Postal Code"
                  placeholder="Enter postal code"
                  name="postalCode"
                  error={false}
                  errorMessage={"Please enter your NPI number"}
                  id="npiNumber"
                  onChange={(e) => {}}
                  type="text"
                  value={""}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="w-full max-w-md md:max-w-2xl">
            <div className="flex items-center justify-between w-full py-2.5 px-4 rounded-md bg-gray-100">
              <div className="">
                <label
                  htmlFor=""
                  className="text-xs md:text-sm text-gray-700 font-semibold"
                >
                  Do you have DEA Licenses?
                </label>
              </div>
              <div className="">
                <Switch
                  checked={true}
                  onChange={(checked) => {}}
                  className="group inline-flex cursor-pointer h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-gradient-to-r data-checked:from-[#3C85F5] data-checked:to-[#1A407A]"
                >
                  <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
                </Switch>
              </div>
            </div>

            <MedicalLicensesSection
              States={[]}
              handleChange={() => {}}
              setFieldValue={() => {}}
              values={[]}
            />
          </div>
        )}

        <div
          className={`flex items-center w-full gap-4 mt-5 max-w-md ${currentStep === 3 && "md:max-w-2xl"}`}
        >
          {currentStep !== 1 && (
            <div className="w-full">
              <ThemeButton
                label="Back"
                onClick={() => {
                  if (currentStep > 1) setCurrentStep(currentStep - 1);
                }}
                variant="outline"
                minWidthClass="w-full"
              />
            </div>
          )}

          <div className="w-full">
            <ThemeButton
              onClick={async () => {
                const step = currentStep as 1 | 2 | 3;
                setCurrentStep((s) => s + 1);
              }}
              label={currentStep === 3 ? "Finish" : "Next"}
              minWidthClass="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
