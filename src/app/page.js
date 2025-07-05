"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateToken, saveToken } from "@/utils/auth";
import LightningLoader from "@/components/LightningLoader";

export default function Home() {
  const [employeeCode, setEmployeeCode] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    const token = generateToken(employeeCode);
    saveToken(token);
    router.push("/chat");
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <LightningLoader />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-3xl font-bold text-center z-10">
        Smart Sense
        <div className="text-base font-normal">Presented by Strombreaker</div>
      </div>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
        <h2 className="my-1">Please Enter Employee Code</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="Employee Code"
            className="border border-white rounded-md p-2"
          />
          <button
            onClick={handleSubmit}
            className="border border-white rounded-md bg-white text-black hover:bg-black hover:text-white"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
