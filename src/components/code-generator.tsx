"use client";
import React, { use, useEffect } from "react";
import { ethers, FunctionFragment, ParamType } from "ethers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { atom, useAtomValue } from "jotai";
import { selectedFunctionAtom } from "@/app/page";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

function generateTypeFromParam(param: ParamType): string {
  if (param.baseType === "array" && param.arrayChildren) {
    return `${generateTypeFromParam(param.arrayChildren)}[]`;
  } else if (param.baseType === "tuple" && param.components) {
    const components = param.components.map(
      (comp) => `${comp.name}: ${generateTypeFromParam(comp)}`
    );
    return `{ ${components.join("; ")} }`;
  } else {
    switch (param.type) {
      case "address":
        return "string";
      case "uint256":
        return "bigint";
      case "bool":
        return "boolean";
      default:
        return "any";
    }
  }
}

function generateInputType(inputs: ReadonlyArray<ParamType>): string {
  return inputs
    .map((input,index) => `${inputName(input,index)}: ${generateTypeFromParam(input)}`)
    .join(", ");
}

function generateOutputType(outputs: ReadonlyArray<ParamType>): string {
  if (outputs.length === 0) return "void";
  if (outputs.length === 1) return generateTypeFromParam(outputs[0]);
  return `[${outputs.map(generateTypeFromParam).join(", ")}]`;
}

const inputName = (input: ParamType, index: number) =>
    input.name.length > 0 ? input.name : `params${index}`;

function generateFetchCode(address: string, method: FunctionFragment): string {
  const inputType = generateInputType(method.inputs);
  const outputType = generateOutputType(method.outputs);
  const paramNames = method.inputs
    .map(inputName)
    .join(", ");

  return `async function fetch${
    method.name.charAt(0).toUpperCase() + method.name.slice(1)
  }(${inputType}): Promise<${outputType}> {
  const url = \`ethereum:${address}/${method.name}?${method.inputs
    .map((input,index) => {
      const name = inputName(input,index)
      return `${name}=\${${name}}`
    })
    .join("&")}\`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const result = await response.json();
  return result${outputType !== "void" ? " as " + outputType : ""};
}`;
}

const EIP6860TSCodeGenerator: React.FC = () => {
  const selectedFunction = useAtomValue(selectedFunctionAtom);
  const { address, fragment: method } = selectedFunction;
  if (!method) return null;
  const generatedCode = generateFetchCode(address, method);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated TypeScript Code for {method.name}</CardTitle>
      </CardHeader>
      <CardContent className=" text-sm">
        <Label>Generated Code:</Label>
        <SyntaxHighlighter
          language="javascript"
          style={oneDark}
          wrapLines
          wrapLongLines
        >
          {generatedCode}
        </SyntaxHighlighter>
      </CardContent>
    </Card>
  );
};

export default EIP6860TSCodeGenerator;
