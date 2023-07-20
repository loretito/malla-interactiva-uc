import React from "react";

export const Footer = () => {
  return (
    <div className="flex justify-center font-mono text-sm text-[#BDBDBD] bg-white pb-2 pt-2">
      <div
        className="flex hover:cursor-pointer text-[#BDBDBD]"
        onClick={() => window.open("https://github.com/loretito", "_black")}
      >
        <p>
          created by <span className="font-bold"> loretito</span>
        </p>
        <img
          src="/github.svg"
          alt="github logo"
          className="w-5"
        />
      </div>
    </div>
  );
};
