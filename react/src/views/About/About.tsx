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
          <h1>Welcome to Atherton!</h1>
        </Paper>
      </Zoom>
    </div>
  );
}

export default Stake;
