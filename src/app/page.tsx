"use client";
import { ethers, InterfaceAbi } from "ethers";
import { atom, useAtomValue } from "jotai";
import { atomWithImmer } from "jotai-immer";
import { Interface } from "ethers";
import { generateUrl } from "../lib/urlGenerator";
import { ContractDisplay } from "@/components/contract-display";
import { FunctionFragment } from "ethers";
import ERC6860URLGenerator from "@/components/erc6860-generator";
import EIP6860TSCodeGenerator from "@/components/code-generator";

export const GLOBAL_PROVIDER = atom(
  ethers.getDefaultProvider("https://ethereum.blockpi.network/v1/rpc/public")
);

interface SelectedFunction {
  address: string;
  abi?: InterfaceAbi;
  fragment?: FunctionFragment;
}
export const selectedFunctionAtom = atomWithImmer<SelectedFunction>({
  address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  fragment: undefined,
  abi: undefined,
});

export default function Home() {
  return (
    <main className="flex min-h-screen w-full container items-center justify-center">
      <div className="flex w-full gap-4">
        <div className="min-w-[458px]">
          <ContractDisplay />
        </div>
        <div className="flex-1 gap-4 flex flex-col overflow-hidden">
          <ERC6860URLGenerator />
          <EIP6860TSCodeGenerator />
        </div>
      </div>
    </main>
  );
}
