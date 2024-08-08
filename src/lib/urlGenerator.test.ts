import { ethers, Interface } from "ethers";
import { generateUrl } from "./urlGenerator";
import { fetchAbi } from "./hooks/useWhatsAbi";
import { InterfaceAbi } from "ethers";
import { JsonRpcProvider } from "ethers";

describe("generateUrl", () => {
  let provider:ethers.JsonRpcProvider;
  let autoresult:Awaited<ReturnType<typeof fetchAbi>>;
  // setup
  beforeAll(async () => {
    provider = ethers.getDefaultProvider("https://ethereum.blockpi.network/v1/rpc/public") as JsonRpcProvider
    autoresult = await fetchAbi(provider,"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
  });

  it("should log the interface from the provided ABI", () => {
    const result = generateUrl(autoresult.abi,"eth.w3link.io",{
      address:autoresult.address,
      method:"balanceOf",
      params:["0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"]
    });
    
    console.log(result)
  });
});