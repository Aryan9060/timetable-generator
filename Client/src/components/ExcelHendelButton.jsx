import React from "react";
import {
  downloadExcelTemplate,
  parseExcelFile,
} from "../utils/HandelExcelFile.js";

export default function ExcelHendelButton({
  formet = [
    {
      "filed 1": "data",
      "filed 2": "data",
      "filed 3": "data",
      "filed 4": "data",
    },
  ],
  handleUplode = (e) => console.log(e, "uplode data"),
  fileName = "data_formet",
}) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await parseExcelFile(file);
        // console.log("Excel data ->",data);
        
        handleUplode(data);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
      }
    }
  };

  return (
    <div className="flex gap-5">
      {/* Download Formet Button */}
      <button
        className="flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl border hover:text-(--primary)  transition-all"
        onClick={() => downloadExcelTemplate(fileName, Object.keys(formet[0]))}
        title="Download Data Format"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Format
      </button>

      {/* Upload Button */}
      <label className="flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl border hover:text-(--primary) transition-all cursor-pointer">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload
        <input
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
