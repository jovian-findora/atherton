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
import { NavLink } from "react-router-dom";
import { t, Trans } from "@lingui/macro";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { getAtherTokenImage, getTokenImage, trim } from "../../helpers";
import { changeApproval, changeStake } from "../../slices/StakeThunk";
import "./howitworks.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
// import ExternalStakePool from "./ExternalStakePool";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";
import { useAppSelector } from "src/hooks";
import AthertonRialto from "../../assets/atherton-onboarding-chainbridge.jpg";
import AthertonAmm from "../../assets/atherton-onboarding-amm.jpg";
import AthertonStaking from "../../assets/atherton-onboarding-staking.jpg";

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

  const usdtAddress = '0xCA8cd6cfeC163c0d57127e7eCAC1E2E13463F69B';

  const atherAddress = useAppSelector(state => {
    return state.app.atherAddress;
  });

  return (
    <div id="howitworks-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className="ather-card">
          <h1>Getting Started</h1>
          <div className="tmar3"></div>

          <h2>1) Cross over to Findora</h2>
          <p>
            <span>To transfer assets to Findora, you can use <a href="http://dev-chainbridge.s3-website-us-west-2.amazonaws.com/transfer" target="_blank">Findora Rialto Bridge</a>. </span>
            <span>This is a bridge that stakes your asset on source network, and mints one-to-one onto Findora Network. It's a trustless bridge and you can transfer back out anytime, just like using </span>
            <span><a href="https://medium.com/chainsafe-systems/a-bridge-to-a-new-world-7627472eaf9d" target="_blank">ChainSafe v2</a></span>
            <img src={AthertonRialto} className="diagram" />
          </p>
          <div className="tmar5"></div>

          <h2>2) Use Your Favorite DEX to Convert into <b>ATHER</b></h2>
          <p>
            <span>Currently ATHER is supported on following DEXs:</span>
            <ul>
              <li><a target="_blank" href={"https://testnet.venice.finance/swap?inputCurrency=" + usdtAddress + "&outputCurrency=" + atherAddress}>Venice Exchange</a></li>
            </ul>
          </p>
          <p>
            <span>(If <b>ATHER</b> symbol is not found, you can add it directly with address: <b>{atherAddress}</b>)</span>
            <img src={AthertonAmm} className="diagram" />
          </p>
          <div className="tmar5"></div>

          <h2>3) Start Seeing Returns by Staking &amp; Bonding</h2>
          <p>
            <ul>
              <li><Link component={NavLink} to={`/stake`} activeClassName="active">Go to Staking Page</Link></li>
            </ul>
            <img src={AthertonStaking} className="diagram" />
          </p>

        </Paper>
      </Zoom>
    </div>
  );
}

export default Stake;
