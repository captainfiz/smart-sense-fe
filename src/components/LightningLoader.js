import Image from "next/image";

const LightningLoader = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black flex items-center justify-center h-screen">
      <Image
        src="/loader.png"
        width={100}
        height={100}
        alt="Lightning Spinner"
        priority
        className="drop-shadow-[0_0_25px_rgba(255,255,0,0.8)] animate-pulse"
      />
    </div>
  );
};

export default LightningLoader;
