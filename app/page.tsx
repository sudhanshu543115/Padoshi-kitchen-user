import Image from "next/image";

export default function Home() {
  return (
    <>
    <header>
       <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={70} height={70} />
        <span className="font-semibold text-lg text-white">
          Padoshi Kitchen
        </span>
      </div>
    </header>
    
    
    
    </>
  );
}
