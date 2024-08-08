import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { selectedFunctionAtom } from "@/app/page";
import { Textarea } from "./ui/textarea";
import { generateUrl } from "@/lib/urlGenerator";
import Link from "next/link";

const ERC6860URLGenerator = () => {
  const [selectedFunction] = useAtom(selectedFunctionAtom);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [url, setUrl] = useState("");
  const [web3url, setWeb3url] = useState("");

  useEffect(() => {
    if (selectedFunction?.fragment) {
      const newParams: Record<string, string> = {};
      selectedFunction.fragment.inputs.forEach((input) => {
        newParams[input.name] = "";
      });
      setParameters(newParams);
    } else {
      setParameters({});
    }
  }, [selectedFunction]);

  useEffect(() => {
    console.log(selectedFunction)
    if (selectedFunction?.address && selectedFunction?.fragment && selectedFunction?.abi) {
      const paramString = Object.entries(parameters)
        .map(([_, value]) => `${value}`)
        .join("/");
      
      let appendPath = `${selectedFunction.fragment.name}`
      if(paramString.length > 0){
        appendPath += "/" + paramString
      }
      
      try{
        const result = generateUrl(selectedFunction.abi!, "eth.w3link.io", {
          address: selectedFunction.address,
          method: selectedFunction.fragment.name,
          params: Object.values(parameters),
        })
  
        console.log(result)

        const newUrl = `web3://${selectedFunction.address}:1/${appendPath}`;
        setWeb3url(newUrl);
        
        const url = result.toString();
        setUrl(url);
      }catch(e:any){
        console.log(e)
        setWeb3url(e.message);
        setUrl("");
      }
    } else {
      setWeb3url("");
      setUrl("");
    }
  }, [selectedFunction, parameters]);

  if (!selectedFunction) {
    return <div>No function selected</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>EIP-6860 URL Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2 font-bold">
            {selectedFunction.address} ({selectedFunction.fragment?.name || ""})
          </div>
          {selectedFunction.fragment?.inputs.map((input) => (
            <div key={input.name} className=" flex items-center">
              <Label htmlFor={input.name} className="w-64">
                {input.name}
              </Label>
              <Input
                id={input.name}
                placeholder={`${input.type}`}
                value={parameters[input.name] || ""}
                onChange={(e) =>
                  setParameters((prev) => ({
                    ...prev,
                    [input.name]: e.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div className="space-y-2 break-all">
            <Link href={url} className="text-blue-600" target="__blank">{url}</Link>
          </div>
          <div className="space-y-2 break-all">{web3url}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ERC6860URLGenerator;
