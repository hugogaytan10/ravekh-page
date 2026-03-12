import React from "react";
import { PolicySectionList } from "../interface/PolicySectionList";

export const PrivacyPolicyPage = ({ title, sections }) => {
  return (
    <div className="bg-gray-100 py-10 px-5 md:px-20">
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{title}</h1>
        <PolicySectionList sections={sections} />
      </div>
    </div>
  );
};
