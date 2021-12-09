import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as AthertonStakingABI } from "../abi/AthertonStaking.json";
import { abi as sATHER } from "../abi/sAtherton.json";
import { abi as TreasuryABI } from "../abi/AthertonTreasury.json";
import { abi as PairABI } from "../abi/IUniswapV2Pair.json";
import { abi as Erc20ABI } from "../abi/ERC20.json";
import { setAll, getTokenPrice, getMarketPrice } from "../helpers";
import apollo from "../lib/apolloClient";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import { AthertonStaking, SAtherton, IUniswapV2Pair, ERC20 } from "src/typechain";

interface IProtocolMetrics {
  readonly timestamp: string;
  readonly atherCirculatingSupply: string;
  readonly sAtherCirculatingSupply: string;
  readonly totalSupply: string;
  readonly atherPrice: string;
  readonly marketCap: string;
  readonly totalValueLocked: string;
  readonly treasuryMarketValue: string;
  readonly nextEpochRebase: string;
  readonly nextDistributedAther: string;
}

export const loadAppDetails = createAsyncThunk(
  "app/loadAppDetails",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch }) => {
//     const protocolMetricsQuery = `
//   query {
//     _meta {
//       block {
//         number
//       }
//     }
//     protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
//       timestamp
//       atherCirculatingSupply
//       sAtherCirculatingSupply
//       totalSupply
//       atherPrice
//       marketCap
//       totalValueLocked
//       treasuryMarketValue
//       nextEpochRebase
//       nextDistributedAther
//     }
//   }
// `;

    // const graphData = await apollo<{ protocolMetrics: IProtocolMetrics[] }>(protocolMetricsQuery);

    // if (!graphData || graphData == null) {
    //   console.error("Returned a null response when querying TheGraph");
    //   return;
    // }
    const pairAddr = '0x4eb169da21ace2E7Ed5Da2e41319B09d51e6E4d7';
    const e18 = '1000000000000000000';
    const e9 = '1000000000';

    // try {
    //   const bondcalc = new AthertonBondCalculator__factory().attach(addresses[networkID].ATHER_EVAL_ADDRESS).connect(provider);
    //   const n = await bondcalc.valuation(pairAddr, e18);
    //   const c = parseInt(n.toString(), 10) / 1000000000;
    //   console.log(c);
    // } catch (e) {

    // }
    // const stakeAllowance = await atherContract.allowance(address, addresses[networkID].);

     // parseFloat(graphData.data.protocolMetrics[0].totalValueLocked);
    // NOTE (appleseed): marketPrice from Graph was delayed, so get CoinGecko price
    // const marketPrice = parseFloat(graphData.data.protocolMetrics[0].atherPrice);
    const pair = new ethers.Contract(pairAddr, PairABI, provider) as IUniswapV2Pair;
    const r = await pair.getReserves();
    let v: any = r.reserve0.mul(e18).div(r.reserve1).div(e9);
    v = parseInt(v.toString(), 10) / 1000000000;
    let marketPrice = v; //parseInt(atherPrice.toString(), 10);
    // try {
    //   const originalPromiseResult = await dispatch(
    //     loadMarketPrice({ networkID: networkID, provider: provider }),
    //   ).unwrap();
    //   marketPrice = originalPromiseResult?.marketPrice;
    // } catch (rejectedValueOrSerializedError) {
    //   // handle error here
    //   console.error("Returned a null response from dispatch(loadMarketPrice)");
    //   return;
    // }
    const ather = new ethers.Contract(addresses[networkID].ATHER_ADDRESS, Erc20ABI, provider) as ERC20;
    const atherTotalSupplyBN = await ather.totalSupply();
    const totalSupply = parseInt(atherTotalSupplyBN.div(e18).toString(), 10); // parseFloat(graphData.data.protocolMetrics[0].totalSupply);

    const sather = new ethers.Contract(addresses[networkID].SATHER_ADDRESS, Erc20ABI, provider) as ERC20;
    const sAtherTotalSupplyBN = await sather.totalSupply();
    const sAtherTotalSupply = parseInt(sAtherTotalSupplyBN.div(e18).toString(), 10); // parseFloat(graphData.data.protocolMetrics[0].totalSupply);
    const circulatingSupply = parseInt(atherTotalSupplyBN.sub(sAtherTotalSupplyBN).div(e18).toString(), 10);
    console.log(circulatingSupply);

    const stakingTVL = sAtherTotalSupply * marketPrice;

    const marketCap = totalSupply * marketPrice; // parseFloat(graphData.data.protocolMetrics[0].marketCap);
    const circSupply = totalSupply - sAtherTotalSupply; //parseFloat(graphData.data.protocolMetrics[0].atherCirculatingSupply);
    const treasuryMarketValue = 10000000; // parseFloat(graphData.data.protocolMetrics[0].treasuryMarketValue);
    // const currentBlock = parseFloat(graphData.data._meta.block.number);

    if (!provider) {
      console.error("failed to connect to provider, please connect your wallet");
      return {
        stakingTVL,
        marketPrice,
        marketCap,
        circSupply,
        totalSupply,
        treasuryMarketValue,
      } as IAppData;
    }
    const currentBlock = await provider.getBlockNumber();

    const stakingContract = new ethers.Contract(
      addresses[networkID].STAKING_ADDRESS as string,
      AthertonStakingABI,
      provider,
    ) as AthertonStaking;

    const satherMainContract = new ethers.Contract(
      addresses[networkID].SATHER_ADDRESS as string,
      sATHER,
      provider,
    ) as SAtherton;

    // Calculating staking
    const epoch = await stakingContract.epoch();
    const stakingReward = epoch.distribute.div(e18);
    const circ = sAtherTotalSupply;
    const stakingRebase = Number(stakingReward.toString()) / circ;
    const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
    const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;

    // Current index
    const currentIndex = 0;
    // console.log(currentIndex);

    return {
      currentIndex: ethers.utils.formatUnits(currentIndex, "gwei"),
      currentBlock,
      fiveDayRate,
      stakingAPY,
      stakingTVL,
      stakingRebase,
      marketCap,
      marketPrice,
      circSupply,
      totalSupply,
      treasuryMarketValue,

      atherAddress: addresses[networkID].ATHER_ADDRESS,
      satherAddress: addresses[networkID].SATHER_ADDRESS,
      atherUsdAddress: addresses[networkID].ATHER_USD_ADDRESS,
    } as IAppData;
  },
);

/**
 * checks if app.slice has marketPrice already
 * if yes then simply load that state
 * if no then fetches via `loadMarketPrice`
 *
 * `usage`:
 * ```
 * const originalPromiseResult = await dispatch(
 *    findOrLoadMarketPrice({ networkID: networkID, provider: provider }),
 *  ).unwrap();
 * originalPromiseResult?.whateverValue;
 * ```
 */
export const findOrLoadMarketPrice = createAsyncThunk(
  "app/findOrLoadMarketPrice",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch, getState }) => {
    const state: any = getState();
    let marketPrice;
    // check if we already have loaded market price
    if (state.app.loadingMarketPrice === false && state.app.marketPrice) {
      // go get marketPrice from app.state
      marketPrice = state.app.marketPrice;
    } else {
      // we don't have marketPrice in app.state, so go get it
      try {
        const originalPromiseResult = await dispatch(
          loadMarketPrice({ networkID: networkID, provider: provider }),
        ).unwrap();
        marketPrice = originalPromiseResult?.marketPrice;
      } catch (rejectedValueOrSerializedError) {
        // handle error here
        console.error("Returned a null response from dispatch(loadMarketPrice)");
        return;
      }
    }
    return { marketPrice };
  },
);

/**
 * - fetches the ATHER price from CoinGecko (via getTokenPrice)
 * - falls back to fetch marketPrice from ather-dai contract
 * - updates the App.slice when it runs
 */
const loadMarketPrice = createAsyncThunk("app/loadMarketPrice", async ({ networkID, provider }: IBaseAsyncThunk) => {
  let marketPrice: number;
  try {
    marketPrice = await getMarketPrice({ networkID, provider });
    marketPrice = marketPrice / Math.pow(10, 9);
  } catch (e) {
    marketPrice = await getTokenPrice("atherton");
  }
  return { marketPrice };
});

interface IAppData {
  readonly circSupply?: number;
  readonly currentIndex?: string;
  readonly currentBlock?: number;
  readonly fiveDayRate?: number;
  readonly loading: boolean;
  readonly loadingMarketPrice: boolean;
  readonly marketCap?: number;
  readonly marketPrice?: number;
  readonly stakingAPY?: number;
  readonly stakingRebase?: number;
  readonly stakingTVL?: number;
  readonly totalSupply?: number;
  readonly treasuryBalance?: number;
  readonly treasuryMarketValue?: number;

  readonly atherAddress?: string;
  readonly satherAddress?: string;
  readonly atherUsdAddress?: string;
}

const initialState: IAppData = {
  loading: false,
  loadingMarketPrice: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchAppSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAppDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAppDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAppDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      })
      .addCase(loadMarketPrice.pending, (state, action) => {
        state.loadingMarketPrice = true;
      })
      .addCase(loadMarketPrice.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loadingMarketPrice = false;
      })
      .addCase(loadMarketPrice.rejected, (state, { error }) => {
        state.loadingMarketPrice = false;
        console.error(error.name, error.message, error.stack);
      });
  },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
