import React from "react";
import { Loader } from "./components";

const loading = () => {
  return (
    <div>
      <Loader />
      <h2 className="text-lg font-medium text-gray-700">Loading...</h2>
    </div>
  );
};

export default loading;
