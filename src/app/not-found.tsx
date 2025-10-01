import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center flex-col  h-full w-full bg-white min-h-dvh">
      <div className="container mx-auto lg:max-w-7xl md:max-w-6xl sm:max-w-4xl">
        <div className="grid grid-cols-1 items-center lg:grid-cols-2 px-4 lg:px-8">
          <div className="flex flex-col lg:items-start lg:justify-start items-center justify-center lg:text-start text-center">
            <h1 className="text-primary mb-2 font-semibold text-sm md:text-base">
              404 error
            </h1>
            <h2 className="text-black mb-3 font-semibold text-4xl md:text-6xl">
              Page not found
            </h2>
            <p className="text-gray-800 mb-6 text-base md:text-xl font-normal">
              Sorry, the page you are looking for doesn’t exist.
            </p>
            <Link
              className="rounded-full  text-white font-semibold text-sm md:text-base py-1.5 md:py-3 px-2.5 md:px-8 bg-gradient-to-r from-[#3C85F5] to-[#1A407A] hover:from-[#3C85F5] hover:to-[#1A407A] hover:bg-gradient-to-l"
              href="/"
            >
              Go Home
            </Link>
          </div>

          <div className="lg:block hidden">
            <Image
              src={"/images/NotFoundIllustration.svg"}
              alt="not found illustration"
              className="h-60"
              width={1020}
              height={1020}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
