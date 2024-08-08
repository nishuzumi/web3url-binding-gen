import { ethers, FormatType, FunctionFragment, ParamType } from "ethers";
import { Interface } from "ethers";
import { InterfaceAbi } from "ethers";

export type Caller = {
  from?: string,
  address: string,
  method: string,
  params?: any[],
  blockNumber?: number
}

/**
 * Generate Url 
 * Currently Web3Url have not support some type like array or tuple in auto mode
 * So if types have any unsupport types, will auto switch to manuel mode
 */
export function generateUrl(abi: InterfaceAbi, base: string, caller: Caller) {
  const inter = Interface.from(abi)


  if (!inter.hasFunction(caller.method)) throw Error("Can not find the method:" + caller.method)

  // https://host.[chainid.].base/method/*argument/?returns=()
  // const method = inter.getFunction(caller.method)!
  const path = buildParamsPath(inter, caller)
  console.log("paht", path)

  const host = `https://${caller.address}.${base}${path}`;
  const url = new URL(host)
  return url
}

// not support tuple and array currently
function buildParamsPath(abi: Interface, caller: Caller) {
  let autoMode = true

  const method = abi.getFunction(caller.method)!
  // if only has bool,uint,int,address,bytes,string
  for (const input of method.inputs) {
    if (input.baseType === "tuple" || input.baseType === "array") {
      throw Error("Unsupport type:" + input.baseType)
      break
    }
  }

  return buildAutoPath(abi, caller)
}

function buildAutoPath(abi: Interface, caller: Caller) {
  const method = abi.getFunction(caller.method)!
  let path = `/${caller.method}`
  if (method.inputs.length != 0) {
    if (caller.params === undefined) throw Error("Params is required")
    const abiCoder = ethers.AbiCoder.defaultAbiCoder()
    for (const [index, input] of method.inputs.entries()) {
      // check value type
      // try to use type to parse the value

      // only for type test
      abiCoder.encode([input], [caller.params[index]])

      path += `/${caller.params[index]}`
    }
  }
  
  console.log("path", path,method.outputs)
  const returns = joinParams("sighash",method.outputs)
  path += `?returns=${returns}`
  return path
}

// add test
function joinParams(format: FormatType, params: ReadonlyArray<ParamType>): string { 
    return "(" + params.map((p) => p.format(format)).join((format === "full") ? ", ": ",") + ")";
}
