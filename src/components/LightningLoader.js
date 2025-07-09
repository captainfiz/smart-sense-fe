// "use client";

// import Image from "next/image";

// const LightningLoader = () => {
//   return (
//     <div className="flex flex-col items-center justify-center gap-8 relative">
//       <div className="animate-[spin_2s_linear_infinite_reverse]">
//         <div className="text-yellow-400 text-6xl animate-pulse drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]">
//           <Image
//             src="/loader.png"
//             width={100}
//             height={100}
//             alt="Lightning Spinner"
//             priority
//             className="drop-shadow-[0_0_25px_rgba(255,255,0,0.8)]"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LightningLoader;


import Image from "next/image";

const LightningLoader = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black flex items-center justify-center h-screen">
      {/* <div className="animate-[spin_2s_linear_infinite_reverse]"> */}
        <Image
          src="/loader.png"
          width={100}
          height={100}
          alt="Lightning Spinner"
          priority
          className="drop-shadow-[0_0_25px_rgba(255,255,0,0.8)] animate-pulse"
        />
      {/* </div> */}
    </div>
  );
};

export default LightningLoader;
