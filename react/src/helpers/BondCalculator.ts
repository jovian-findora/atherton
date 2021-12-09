import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { NetworkID } from "src/lib/Bond";
import { abi as TokenEvalutorUniswapV2ABI } from "src/abi/TokenEvalutorUniswapV2.json";
import { ethers } from "ethers";
import { addresses } from "src/constants";
import { TokenEvalutorUniswapV2 } from "../typechain";

export const getBondCalculator = (networkID: NetworkID, provider: StaticJsonRpcProvider) => {
  return new ethers.Contract(
    addresses[networkID].ATHER_EVAL_ADDRESS as string,
    TokenEvalutorUniswapV2ABI,
    provider,
  ) as TokenEvalutorUniswapV2;
};
