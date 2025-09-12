import React from "react";
import Link from "next/link";
import { MdOutlineIntegrationInstructions } from "react-icons/md";
import Image from "next/legacy/image";

const Integration = () => {
  const appIntegration = [
    {
      appName: "Facebook",
      description:
        "Facebook Conversion API is a server-side tool that lets you track key web-site and offline events, or customer actions, sending directly to Facebook's servers, instead of through your browser.",
      link: "/Settings/Integration/FacebookIntegration",
    },
  ];

  return (
    <div className="integration">
      <div className="container">
        <ul className="grid grid-cols-1 lg:grid-cols-3">
          {appIntegration.map((app, index) => (
            <li
              key={index}
              className="border-2  flex items-center justify-center flex-col rounded-sm text-white "
            >
              <Image
                src="https://res.cloudinary.com/dc1cdbirz/image/upload/v1727337687/ita-luxury/lbjyjdtuxu7dv6olpayw.webp"
                alt="faceboook"
                width={200}
                style={{ objectFit: "contain" }}

                height={200}
              />
              <div className="info bg-primary border-t p-4 flex flex-col">
                <h2 className="text-lg font-semibold text-center py-1">
                  {app.appName}
                </h2>
                <p className="text-xs max-h-20 overflow-y-auto">
                  {app.description}
                </p>
                <Link
                  className="flex w-fit self-end my-2 bg-red-600 items-center text-white  rounded-sm  font-semibold p-2"
                  href={app.link}
                >
                  <span className="mr-2">Integration</span>
                  <MdOutlineIntegrationInstructions />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Integration;
