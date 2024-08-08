import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { whatsabi } from '@shazow/whatsabi';
import { InterfaceAbi } from "ethers";

export type AutoABI = Awaited<ReturnType<typeof fetchAbi>>

interface UseWhatsAbiResult {
  abi: AutoABI;
  isLoading: boolean;
  error: Error | null;
}
export function useWhatAbi(
  provider: ethers.Provider,
  address: string
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [abi, setAbi] = useState<AutoABI>()

  useEffect(() => {
    if (!provider || !address) return
    // TODO: check address format

    setLoading(true)
    setError(undefined)

    fetchAbi(provider, address).then(setAbi, setError).finally(() => {
      setLoading(false)
    })
  }, [provider, address])

  return {
    abi,
    isLoading: loading,
    error
  } as UseWhatsAbiResult
}

export const fetchAbi = async (provider: ethers.Provider, address: string) => {
  return whatsabi.autoload(address, { provider, followProxies: true })
}