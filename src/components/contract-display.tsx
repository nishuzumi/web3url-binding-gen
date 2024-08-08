import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FunctionFragment, Interface, InterfaceAbi } from "ethers";
import { AutoABI, useWhatAbi } from "@/lib/hooks/useWhatsAbi";
import { ParamType } from "ethers";
import { useAtomValue, useSetAtom } from "jotai";
import { GLOBAL_PROVIDER, selectedFunctionAtom } from "@/app/page";
import { WritableDraft } from "immer";

export const ContractDisplay = () => {
  const [address, setAddress] = React.useState(
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  );
  const provider = useAtomValue(GLOBAL_PROVIDER);
  const setSelectedFunction = useSetAtom(selectedFunctionAtom);

  const { abi, isLoading, error } = useWhatAbi(provider, address);

  useEffect(() => {
    if (!abi) return;
    setSelectedFunction((prev) => {
      prev.abi = abi.abi;
    });
  }, [abi, setSelectedFunction]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Input
            type="string"
            placeholder="Address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>加载中...</p>}
        {error && <p>加载失败: {error.message}</p>}
        {abi?.abi.length > 0 && <ABIFunctionsDisplay abi={abi} />}
      </CardContent>
    </Card>
  );
};

export const ABIFunctionsDisplay = ({ abi }: { abi: AutoABI }) => {
  const hasArrayOrTuple = (inputs: readonly ParamType[]) => {
    return inputs.some(
      (input) => input.type.includes("[]") || input.type.includes("tuple")
    );
  };

  // select function jotai
  const selectedFunction = useSetAtom(selectedFunctionAtom);
  const interfaces = Interface.from(abi.abi);
  const functions = interfaces.fragments.filter(
    (item) => item.type === "function"
  ) as FunctionFragment[];
  const onClick = (func: FunctionFragment) => {
    selectedFunction(o=>{
      o.address = abi.address
      o.fragment = func as any
    });
  };

  return (
    <ScrollArea className="w-full rounded-md border">
      <div className="px-4">
        {functions.map((func, index) => {
          const isView = func.stateMutability === "view";
          const isDisabled = hasArrayOrTuple(func.inputs ?? []);

          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center justify-between py-2 border-b last:border-b-0 ${
                      isDisabled
                        ? "opacity-50"
                        : "hover:bg-gray-100 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isDisabled) {
                        onClick(func);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium truncate max-w-80">
                        {func.name}
                      </span>
                      {isView && <Badge>View</Badge>}
                    </div>
                    {isDisabled && (
                      <span className="text-sm text-gray-500">暂不支持</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>函数名称：{func.name}</p>
                  <p>
                    输入:{" "}
                    {func.inputs?.map((input) => input.type).join(", ") ?? "无"}
                  </p>
                  <p>
                    输出:{" "}
                    {func.outputs?.map((output) => output.type).join(", ") ??
                      "无"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ABIFunctionsDisplay;
