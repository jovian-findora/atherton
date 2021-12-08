import { ethers, BigNumber } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20ABI } from "../abi/IERC20.json";
import { abi as TreasuryABI } from "../abi/AthertonTreasury.json";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./PendingTxnsSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./AccountSlice";
import { error, info } from "../slices/MessagesSlice";
import { IActionValueAsyncThunk, IChangeApprovalAsyncThunk, IJsonRPCError } from "./interfaces";
import { segmentUA } from "../helpers/userAnalyticHelpers";
import { IERC20, AthertonTreasury } from "src/typechain";

interface IUAData {
  address: string;
  value: string;
  approved: boolean;
  txHash: string | null;
  type: string | null;
}

function alreadyApprovedToken(token: string, stakeAllowance: BigNumber) {
  // set defaults
  let bigZero = BigNumber.from("0");
  let applicableAllowance = bigZero;

  // determine which allowance to check
  if (token === "ather") {
    applicableAllowance = stakeAllowance;
  } else if (token === "sather") {
    // applicableAllowance = unstakeAllowance;
  }

  // check if allowance exists
  if (applicableAllowance.gt(bigZero)) return true;

  return false;
}

export const changeApproval = createAsyncThunk(
  "stake/changeApproval",
  async ({ token, provider, address, networkID }: IChangeApprovalAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const atherContract = new ethers.Contract(addresses[networkID].ATHER_ADDRESS as string, ierc20ABI, signer) as IERC20;
    // const satherContract = new ethers.Contract(addresses[networkID].SATHER_ADDRESS as string, ierc20ABI, signer) as IERC20;
    let approveTx;
    let stakeAllowance = await atherContract.allowance(address, addresses[networkID].TREASURY_ADDRESS);

    // return early if approval has already happened
    if (alreadyApprovedToken(token, stakeAllowance)) {
      dispatch(info("Approval completed."));
      return dispatch(
        fetchAccountSuccess({
          staking: {
            atherStake: +stakeAllowance,
          },
        }),
      );
    }

    try {
      if (token === "ather") {
        // won't run if stakeAllowance > 0
        approveTx = await atherContract.approve(
          addresses[networkID].TREASURY_ADDRESS,
          ethers.utils.parseEther("1000000000").toString(),
        );
      } else if (token === "sather") {
        // approveTx = await satherContract.approve(
        //   addresses[networkID].TREASURY_ADDRESS,
        //   ethers.utils.parseEther("1000000000").toString(),
        // );
      }

      const text = "Approve " + (token === "ather" ? "Staking" : "Unstaking");
      const pendingTxnType = token === "ather" ? "approve_staking" : "approve_unstaking";
      if (approveTx) {
        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

        await approveTx.wait();
      }
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

    // go get fresh allowances
    stakeAllowance = await atherContract.allowance(address, addresses[networkID].TREASURY_ADDRESS);

    return dispatch(
      fetchAccountSuccess({
        staking: {
          atherStake: +stakeAllowance,
        },
      }),
    );
  },
);

export const changeStake = createAsyncThunk(
  "stake/changeStake",
  async ({ action, value, provider, address, networkID }: IActionValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const staking = new ethers.Contract(
      addresses[networkID].TREASURY_ADDRESS as string,
      TreasuryABI,
      signer,
    ) as AthertonTreasury;
    const stakingHelper = new ethers.Contract(
      addresses[networkID].TREASURY_ADDRESS as string,
      TreasuryABI,
      signer,
    ) as AthertonTreasury;

    let stakeTx;
    let uaData: IUAData = {
      address: address,
      value: value,
      approved: true,
      txHash: null,
      type: null,
    };
    try {
      if (action === "stake") {
        uaData.type = "stake";
        stakeTx = await stakingHelper.stake(addresses[networkID].STAKING_ADDRESS, address, ethers.utils.parseEther(value));
      } else {
        uaData.type = "unstake";
        stakeTx = await staking.unstake(addresses[networkID].STAKING_ADDRESS, address, ethers.utils.parseEther(value));
      }
      const pendingTxnType = action === "stake" ? "staking" : "unstaking";
      uaData.txHash = stakeTx.hash;
      dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
      await stakeTx.wait();
    } catch (e: unknown) {
      uaData.approved = false;
      const rpcError = e as IJsonRPCError;
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(
          error("You may be trying to stake more than your balance! Error code: 32603. Message: ds-math-sub-underflow"),
        );
      } else {
        dispatch(error(rpcError.message));
      }
      return;
    } finally {
      if (stakeTx) {
        segmentUA(uaData);
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
    dispatch(getBalances({ address, networkID, provider }));
  },
);
