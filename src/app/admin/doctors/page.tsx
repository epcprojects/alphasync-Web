"use client";

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  DoctorFilledIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeButton } from "@/app/components";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import ReactPaginate from "react-paginate";
import DoctorListView, {
  Doctor,
} from "@/app/components/ui/cards/DoctorListView";
import { doctors } from "../../../../public/data/Doctors";
import AddEditDoctorModal from "@/app/components/ui/modals/AddEditDoctorModal";
import DoctorDeleteModal from "@/app/components/ui/modals/DoctorDeleteModal";

function DoctorContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const [isModalOpne, setIsModalOpen] = useState(false);
  const [isDeleteModalOpne, setIsDeleteModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor>();
  const orderStatuses = [
    { label: "All Status" },
    { label: "Active" },
    { label: "Inactive" },
  ];

  const itemsPerPage = 5;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const filteredProducts = doctors.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.specialty.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "All Status" ? true : p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredProducts.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(selected + 1));
    router.replace(`?${params.toString()}`);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setIsDeleteModalOpen(true);
    console.log(doctor);
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <DoctorFilledIcon />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Doctors
          </h2>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] w-fit">
          <div className="flex items-center relative">
            <span className="absolute left-3">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <Menu>
            <MenuButton className="inline-flex py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full  text-sm/6 font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
              {selectedStatus} <ArrowDownIcon fill="#717680" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
            >
              {orderStatuses.map((status) => (
                <MenuItem key={status.label}>
                  <button
                    onClick={() => {
                      setSelectedStatus(status.label);
                      setCurrentPage(0);
                    }}
                    className="flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full"
                  >
                    {status.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

          <ThemeButton
            label="Add New"
            icon={<PlusIcon />}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
          <div className="col-span-3">
            <h2>Name</h2>
          </div>
          <div className="col-span-2">
            <h2>Specialty</h2>
          </div>
          <div className="col-span-2">
            <h2>Phone</h2>
          </div>
          <div className="col-span-2">
            <h2>Medical License</h2>
          </div>
          <div className="col-span-2">
            <h2>Status</h2>
          </div>
          <div className="col-span-1">
            <h2>Actions</h2>
          </div>
        </div>

        {currentItems.map((doctor) => (
          <DoctorListView
            onRowClick={() => router.push(`/orders/${doctor.id}`)}
            key={doctor.id}
            doctor={doctor}
            onEditDoctor={() => handleEdit(doctor)}
            onDeleteDoctor={() => handleDelete(doctor)}
          />
        ))}
        <div className="flex justify-center ">
          {currentItems.length > 0 && (
            <div className="w-full flex items-center justify-center">
              <ReactPaginate
                breakLabel="..."
                nextLabel={
                  <span className="flex items-center justify-center h-9 md:w-full md:h-full w-9 select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                    <span className="hidden md:inline-block">Next</span>
                    <span className="block mb-0.5 rotate-180">
                      <ArrowLeftIcon />
                    </span>
                  </span>
                }
                previousLabel={
                  <span className="flex items-center  h-9 md:w-full md:h-full w-9 justify-center select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                    <span className="md:mb-0.5">
                      <ArrowLeftIcon />
                    </span>
                    <span className="hidden md:inline-block">Previous</span>
                  </span>
                }
                onPageChange={handlePageChange}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                pageCount={pageCount}
                forcePage={currentPage}
                pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 h-11 w-11 leading-8 text-center hover:bg-gray-100 cursor-pointer  hidden md:block"
                containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white"
                pageClassName=" rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                activeClassName="bg-gray-200 text-gray-900 font-medium"
                previousClassName="md:px-4 md:py-2 rounded-full  absolute left-3 md:left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
                nextClassName="md:px-4 md:py-2 rounded-full bg-gray-50  absolute end-3 md:end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
                breakClassName="px-3 py-1 font-semibold text-gray-400"
              />

              <h2 className="absolute md:hidden text-gravel font-medium text-sm">
                Page {currentPage + 1} of {pageCount}
              </h2>
            </div>
          )}
        </div>
      </div>
      <AddEditDoctorModal
        isOpen={isModalOpne}
        onClose={() => {
          setIsModalOpen(false);
          setEditDoctor(undefined);
        }}
        onConfirm={() => {
          setIsModalOpen(false);
          setEditDoctor(undefined);
        }}
        initialData={editDoctor}
      />

      <DoctorDeleteModal
        isOpen={isDeleteModalOpne}
        onDelete={() => {
          console.log("Doctor deleted");
          setIsDeleteModalOpen(false);
        }}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        subtitle="Are you sure you want to delete this doctor? This action cannot be undone."
        title="Delete Doctor?"
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorContent />
    </Suspense>
  );
}
