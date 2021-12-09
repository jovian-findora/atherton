import { useCallback, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
  Divider,
} from "@material-ui/core";
import { t, Trans } from "@lingui/macro";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { getAtherTokenImage, getTokenImage, trim } from "../../helpers";
import { changeApproval, changeStake } from "../../slices/StakeThunk";
import "./about.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
// import ExternalStakePool from "./ExternalStakePool";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";
import { useAppSelector } from "src/hooks";

import AthertonDiagram from "../../assets/atherton-diagram.jpg";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const sAtherImg = getTokenImage("sather");
const atherImg = getAtherTokenImage(16, 16);

function Stake() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainID } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState(0);

  // const tokens = useAppSelector(state => state.zap.balances);
  const isAppLoading = useAppSelector(state => state.app.loading);
  const currentIndex = useAppSelector(state => {
    return state.app.currentIndex;
  });
  const fiveDayRate = useAppSelector(state => {
    return state.app.fiveDayRate;
  });
  const atherBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.ather;
  });
  const satherBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.sather;
  });
  const wsatherBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.wsather;
  });
  const stakeAllowance = useAppSelector(state => {
    return (state.account.staking && state.account.staking.atherStake) || 0;
  });
  const unstakeAllowance = useAppSelector(state => {
    return (state.account.staking && state.account.staking.atherUnstake) || 0;
  });
  const stakingRebase = useAppSelector(state => {
    return state.app.stakingRebase || 0;
  });
  const stakingAPY = useAppSelector(state => {
    return state.app.stakingAPY || 0;
  });
  const stakingTVL = useAppSelector(state => {
    return state.app.stakingTVL;
  });

  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });

  // const inputTokenImages = useMemo(
  //   () =>
  //     Object.entries(tokens)
  //       .filter(token => token[0] !== "sather")
  //       .map(token => token[1].img)
  //       .slice(0, 3),
  //   [tokens],
  // );

  const setMax = () => {
    if (view === 0) {
      setQuantity(Number(atherBalance));
    } else {
      setQuantity(Number(satherBalance));
    }
  };

  const onSeekApproval = async (token: string) => {
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };

  const onChangeStake = async (action: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0) {
      // eslint-disable-next-line no-alert
      return dispatch(error(t`Please enter a value!`));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity.toString(), "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(atherBalance, "gwei"))) {
      return dispatch(error(t`You cannot stake more than your ATHER balance.`));
    }

    if (action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(satherBalance, "gwei"))) {
      return dispatch(error(t`You cannot unstake more than your sATHER balance.`));
    }

    await dispatch(changeStake({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "ather") return stakeAllowance > 0;
      return 0;
    },
    [stakeAllowance],
  );

  const isAllowanceDataLoading = (stakeAllowance == null && view === 0);

  let modalButton: any[] = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      <Trans>Connect Wallet</Trans>
    </Button>,
  );

  const changeView = (_event: React.ChangeEvent<{}>, newView: number) => {
    setView(newView);
  };

  const trimmedBalance = Number(
    [satherBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);
  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const nextRewardValue = trim((Number(stakingRebasePercentage) / 100) * trimmedBalance, 4);

  return (
    <div id="about-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className="ather-card">
          <h1>Welcome, Future Athletes!</h1>
          <div className="tmar3"></div>
          
          
          <h2>About Atherton</h2>
          {/* <div className="tmar"></div> */}
          <p>
            <span>Atherton (<a href="https://github.com/jovian-findora/atherton" target="_blank">GitHub</a>) is a rebranded fork of </span>
            <span><a href="https://github.com/OlympusDAO/olympusdao.git" target="_blank">OlympusDAO</a> </span>
            <span>v<a href="https://github.com/OlympusDAO/olympus-contracts/tree/Version-1.1" target="_blank">1.1</a> </span>
            <span>ported to <a href="https://findora.org/" target="_blank">Findora Network</a>.</span>
          </p>
          <div className="tmar5"></div>


          <h2>Project Context</h2>
          <p>
            <span>OlympusDAO has been successfully managing a <b>floating currency</b> model, which has fractional backing for its OHM currency (Total-value-locked <b>$4B</b> at some point). </span>
            <span>This had created an investment opportunity for the currency holders while providing a reasonable backing from the treasury to provide protection and reduce volatility.</span>
          </p>
          <p>
            <span>While OlympusDAO had given early investors about x500 returns, the returns are <b>stagnating</b> and the newly onboarded ohmies are unable to </span>
            <span>see the gains (some have entered at all-time-high and are seeing <b><span style={{ color: 'red' }}>-40%</span></b>).</span>
          </p>
          <p>
            <span>Atherton project aims to give believers </span>
            <ul>
              <li>a chance to <b>participate early</b> as founding customers,</li>
              <li>possible <b>incentive match</b> provided by <a href="https://findora.org/" target="_blank">Findora Network</a> for initial onboarding,</li>
            </ul>
            <span>and ultimately, aiming to recreate the success story of OlympusDAO on Findora Network.</span>
          </p>
          <div className="tmar5"></div>

          <h2>Design Overview Diagram</h2>
          <div className="tmar2"></div>
          <img src={AthertonDiagram} className="diagram" />
          <div className="tmar4"></div>
          <p>
            <span>The two major user interactions with Atherton Treasury:</span>
            <ol>
              <li>Staking (dividends + benefits as ATHER value increases)</li>
              <li>Bonding (fixed yield in ATHER)</li>
            </ol>
          </p>
          <div className="tmar3"></div>

          <p>
            <span>The two major income sources for Atherton Treasury:</span>
            <ol>
              <li>Liquidity providing &amp; yield harvesting on AMMs (automated market makers)</li>
              <li>Portfolio rebalancing toward appreciating tokens</li>
            </ol>
          </p>

          <div className="tmar5"></div>
        </Paper>
      </Zoom>
    </div>
  );
}

export default Stake;
