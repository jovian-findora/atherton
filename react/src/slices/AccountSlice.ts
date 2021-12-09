import { BigNumber, BigNumberish, ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sATHER } from "../abi/sAtherton.json";

import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";
import { IERC20, SAtherton } from "src/typechain";

interface IUserBalances {
  balances: {
    ather: string;
    sather: string;
    wsather: string;
  };
}

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const atherContract = new ethers.Contract(addresses[networkID].ATHER_ADDRESS as string, ierc20Abi, provider) as IERC20;
    const atherBalance = await atherContract.balanceOf(address);
    const atherUsdContract = new ethers.Contract(addresses[networkID].ATHER_USD_ADDRESS as string, ierc20Abi, provider) as IERC20;
    const atherUsdBalance = await atherUsdContract.balanceOf(address);
    const satherContract = new ethers.Contract(addresses[networkID].SATHER_ADDRESS as string, ierc20Abi, provider) as IERC20;
    const satherBalance = await satherContract.balanceOf(address);
    // const wsatherContract = new ethers.Contract(addresses[networkID].WSATHER_ADDRESS as string, wsATHER, provider) as WsATHER;
    // const wsatherBalance = await wsatherContract.balanceOf(address);
    // NOTE (appleseed): wsatherAsSather is wsATHER given as a quantity of sATHER

    return {
      balances: {
        ather: ethers.utils.formatEther(atherBalance),
        atherUsd: ethers.utils.formatEther(atherUsdBalance),
        sather: ethers.utils.formatEther(satherBalance),
        // wsather: ethers.utils.formatEther(wsatherBalance),
      },
    };
  },
);

interface IUserAccountDetails {
  staking: {
    atherStake: number;
    atherUnstake: number;
  };
  wrapping: {
    satherWrap: number;
    wsatherUnwrap: number;
  };
}

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk, { dispatch }) => {
    const atherContract = new ethers.Contract(addresses[networkID].ATHER_ADDRESS as string, ierc20Abi, provider) as IERC20;
    const stakeAllowance = await atherContract.allowance(address, addresses[networkID].TREASURY_ADDRESS);

    const satherContract = new ethers.Contract(addresses[networkID].SATHER_ADDRESS as string, sATHER, provider) as SAtherton;
    const unstakeAllowance = await satherContract.allowance(address, addresses[networkID].TREASURY_ADDRESS);
    // const poolAllowance = await satherContract.allowance(address, addresses[networkID].PT_PRIZE_POOL_ADDRESS);
    // const wrapAllowance = await satherContract.allowance(address, addresses[networkID].WSATHER_ADDRESS);

    // const wsatherContract = new ethers.Contract(addresses[networkID].WSATHER_ADDRESS as string, wsATHER, provider) as WsATHER;
    // const unwrapAllowance = await wsatherContract.allowance(address, addresses[networkID].WSATHER_ADDRESS);

    await dispatch(getBalances({ address, networkID, provider }));

    return {
      staking: {
        atherStake: +stakeAllowance,
        atherUnstake: +unstakeAllowance,
      },
      wrapping: {
        // atherWrap: +wrapAllowance,
        // atherUnwrap: +unwrapAllowance,
      },
      pooling: {
        
      },
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "",
      };
    }
    // dispatch(fetchBondInProgress());

    // Calculate bond details.
    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let pendingPayout, bondMaturationBlock;

    // const bondDetails = await bondContract.bondInfo(address);
    let interestDue: BigNumberish = Number(0) / Math.pow(10, 9);
    // bondMaturationBlock = +bondDetails.vesting + +bondDetails.lastBlock;
    bondMaturationBlock = 0;
    pendingPayout = 0;

    let allowance,
      balance = BigNumber.from(0);
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    // formatEthers takes BigNumber => String
    const balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: Number(allowance.toString()),
      balance: balanceVal,
      interestDue,
      bondMaturationBlock,
      pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
    };
  },
);

interface IAccountSlice extends IUserAccountDetails, IUserBalances {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    ather: string;
    sather: string;
    dai: string;
    oldsather: string;
    fsather: string;
    wsather: string;
    wsatherAsSather: string;
    pool: string;
  };
  loading: boolean;
  staking: {
    atherStake: number;
    atherUnstake: number;
  };
  pooling: {
    satherPool: number;
  };
}

const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: { ather: "", sather: "", dai: "", oldsather: "", fsather: "", wsather: "", pool: "", wsatherAsSather: "" },
  staking: { atherStake: 0, atherUnstake: 0 },
  wrapping: { satherWrap: 0, wsatherUnwrap: 0 },
  pooling: { satherPool: 0 },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
