"use client";

import Image from "next/image";

const LogoSection = () => {
  return (
    <div className="flex items-center space-x-4 text-yellow-400">
      <div className="animate-pulse drop-shadow-[0_0_25px_rgba(255,255,0,0.8)]">
        <Image
          src="/loader.png"
          width={50}
          height={50}
          alt="Lightning Spinner"
          priority
        />
      </div>
      <p className="text-1xl font-semibold drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]">
        STROMBREAKER
      </p>
    </div>
  );
};

export default LogoSection;
