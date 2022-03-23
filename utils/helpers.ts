import { EXTERNAL_CONTRACT_ADDRESSES as contractList } from "../helper-hardhat-config";

export const getExternalContract = (contractName: string, network: string) => {
    return contractList
        .find((c) => c?.name === contractName)
        ?.addresses.find((a) => a.network === network)?.address;
};
