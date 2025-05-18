"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { ArchiveBoxIcon, Bars3Icon, BugAntIcon, UserPlusIcon, UsersIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },

  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
  {
    label: "Mint Character",
    href: "/character/mint",
    icon: <UserPlusIcon className="h-4 w-4" />,
  },
  {
    label: "My Characters",
    href: "/character/my-characters",
    icon: <UsersIcon className="h-4 w-4" />,
  },
  {
    label: "Create Item (Admin)",
    href: "/admin/create-item",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
  {
    label: "View Items",
    href: "/items",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
  {
    label: "My Items",
    href: "/character/my-items",
    icon: <ArchiveBoxIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { address: connectedAddress, isConnected } = useAccount();

  const { data: gameTokenBalance } = useScaffoldReadContract({
    contractName: "GameToken",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
    query: { enabled: isConnected },
  });

  const { data: gameTokenSymbol } = useScaffoldReadContract({
    contractName: "GameToken",
    functionName: "symbol",
    query: { enabled: isConnected },
  });

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-ETH</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4 flex items-center gap-x-3">
        {isConnected && gameTokenBalance !== undefined && gameTokenSymbol && (
          <div
            className="btn btn-ghost btn-sm rounded-btn px-2 hidden sm:flex items-center"
            title={`Your ${gameTokenSymbol} balance`}
          >
            <span className="text-sm font-semibold mr-1">{parseFloat(formatEther(gameTokenBalance)).toFixed(2)}</span>
            <span className="text-xs font-medium text-accent">{gameTokenSymbol}</span>
          </div>
        )}
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
