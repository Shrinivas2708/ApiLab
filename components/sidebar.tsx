"use client";

import { Link2, Globe, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function GraphQL({
  size = 24,
  className = "",
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 6.90308L87.323 28.4515V71.5484L50 93.0968L12.677 71.5484V28.4515L50 6.90308ZM16.8647 30.8693V62.5251L44.2795 15.0414L16.8647 30.8693ZM50 13.5086L18.3975 68.2457H81.6025L50 13.5086ZM77.4148 72.4334H22.5852L50 88.2613L77.4148 72.4334ZM83.1353 62.5251L55.7205 15.0414L83.1353 30.8693V62.5251Z"
      />
      <circle cx="50" cy="9.3209" r="8.82" />
      <circle cx="85.2292" cy="29.6605" r="8.82" />
      <circle cx="85.2292" cy="70.3396" r="8.82" />
      <circle cx="50" cy="90.6791" r="8.82" />
      <circle cx="14.7659" cy="70.3396" r="8.82" />
      <circle cx="14.7659" cy="29.6605" r="8.82" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full border-r   flex md:flex-col justify-evenly md:justify-normal">
      <SidebarItem label="REST" icon={Link2} href="/" active={pathname === "/"} />
      <SidebarItem label="GraphQL" icon={GraphQL} href="/graphql" active={pathname === "/graphql"} />
      <SidebarItem label="Realtime" icon={Globe} href="/realtime" active={pathname === "/realtime"} />
      <SidebarItem label="Settings" icon={Settings} href="/settings" active={pathname === "/settings"} />
    </div>
  );
}

function SidebarItem({
  label,
  icon: Icon,
  href,
  active,
}: {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        relative text-xs flex flex-col items-center gap-2  w-full
        transition-colors hover:bg-[#f3f4f6]  dark:hover:bg-[#1b1b1b] px-2 py-2  
        ${active ? "dark:text-white text-black " : "text-muted-foreground hover:text-black dark:hover:text-white"}
      `}
    >
      {active && (
        <div className="absolute md:left-0 rotate-90 md:rotate-0 -bottom-6  md:top-0 h-full w-1  dark:bg-muted-foreground rounded-r bg-black" />
      )}

      <Icon width={20} height={20}  />
      <p>{label}</p>
    </Link>
  );
}
