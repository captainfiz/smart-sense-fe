"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ClockLoader } from "react-spinners";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

function parseJsonWithStatus(input) {
  try {
    const cleaned = input.trim().replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);
    return { status: true, json: parsed };
  } catch (e) {
    return { status: false, json: null };
  }
}
const ChartRender = ({ index, length, currentSet, value }) => {
  const response = parseJsonWithStatus(value.text);
  // Case: Still loading (type === 'graph') and last message
  if (currentSet?.type === "graph" && index === length-2) {
    return (
      <div className="flex justify-start">
        <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none flex justify-center items-center h-[200px] w-[60%] ">
          <ClockLoader color="#00abff" size={40} />
        </div>
      </div>
    );
  }

  // Case: Graph JSON is valid
  if (response?.status) {
    return (
      <div className="flex justify-start">
        <div className="p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
          <Plot
            data={response.json.data}
            layout={{
              autosize: true,
              ...response?.json?.layout,
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              scrollZoom: true,
            }}
            useResizeHandler={true}
            style={{ width: "600px", height: "400px" }}
          />
        </div>
      </div>
    );
  }

  // Case: Text fallback
  return (
    <div className="flex justify-start">
      <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-white text-gray-800 rounded-bl-none">
        <p className="whitespace-pre-wrap">{value.text}</p>
      </div>
    </div>
  );
};

export default ChartRender;
