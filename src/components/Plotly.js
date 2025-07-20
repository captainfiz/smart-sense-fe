"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ClockLoader } from "react-spinners";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const ChartRender = ({ index, value }) => {
  console.log('value :>> ', value);
  return (
    <div className="flex justify-start" key={index}>
      <Plot
        {...value}
        config={{
          responsive: true,
          displayModeBar: true,
          scrollZoom: true,
        }}
        useResizeHandler={true}
        style={{ width: "600px", height: "400px" }}
      />
    </div>
  );
};

export default ChartRender;
