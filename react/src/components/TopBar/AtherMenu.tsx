import { useState, useEffect } from "react";
import { addresses, TOKEN_DECIMALS } from "../../constants";
import { NavLink } from "react-router-dom";
import { Link, SvgIcon, Popper, Button, Paper, Typography, Divider, Box, Fade, Slide } from "@material-ui/core";
import { ReactComponent as InfoIcon } from "../../assets/icons/info-fill.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up.svg";
import { ReactComponent as sAtherTokenImg } from "../../assets/tokens/token_sATHER.svg";
import { ReactComponent as wsAtherTokenImg } from "../../assets/tokens/token_wsATHER.svg";
import { ReactComponent as atherTokenImg } from "../../assets/tokens/token_ATHER.svg";
import { ReactComponent as t33TokenImg } from "../../assets/tokens/token_33T.svg";
import { conf } from "src/constants";

import "./athermenu.scss";
// import { dai, frax } from "src/helpers/AllBonds";
import { Trans } from "@lingui/macro";
import { useWeb3Context } from "../../hooks/web3Context";

import AtherImg from "src/assets/tokens/token_ATHER.svg";
import SAtherImg from "src/assets/tokens/token_sATHER.svg";
import WsAtherImg from "src/assets/tokens/token_wsATHER.svg";
import token33tImg from "src/assets/tokens/token_33T.svg";

import { segmentUA } from "../../helpers/userAnalyticHelpers";

const addTokenToWallet = (tokenSymbol, tokenAddress, address) => async () => {
  if (window.ethereum) {
    const host = window.location.origin;
    let tokenPath;
    let tokenDecimals = TOKEN_DECIMALS;
    switch (tokenSymbol) {
      case "ATHER":
        tokenPath = AtherImg;
        break;
      case "33T":
        tokenPath = token33tImg;
        break;
      case "wsATHER":
        tokenPath = WsAtherImg;
        break;
      default:
        tokenPath = SAtherImg;
    }
    const imageURL = `${host}/${tokenPath}`;

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: imageURL,
          },
        },
      });
      let uaData = {
        address: address,
        type: "Add Token",
        tokenName: tokenSymbol,
      };
      segmentUA(uaData);
    } catch (error) {
      console.log(error);
    }
  }
};

function AtherMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const isEthereumAPIAvailable = window.ethereum;
  const { chainID, address } = useWeb3Context();

  const networkID = chainID;

  const SATHER_ADDRESS = addresses[networkID].SATHER_ADDRESS;
  const ATHER_ADDRESS = addresses[networkID].ATHER_ADDRESS;
  const ATHER_USD_ADDRESS = addresses[networkID].ATHER_USD_ADDRESS;
  const WSATHER_ADDRESS = addresses[networkID].WSATHER_ADDRESS;
  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = "ather-popper";
  return (
    <Box
      component="div"
      onMouseEnter={e => handleClick(e)}
      onMouseLeave={e => handleClick(e)}
      id="ather-menu-button-hover"
    >
      <Button id="ather-menu-button" size="large" variant="contained" color="secondary" title="ATHER" aria-describedby={id}>
        <SvgIcon component={InfoIcon} color="primary" />
        <Typography>ATHER</Typography>
      </Button>

      <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start" transition>
        {({ TransitionProps }) => {
          return (
            <Fade {...TransitionProps} timeout={100}>
              <Paper className="ather-menu" elevation={1}>
                <Box component="div" className="buy-tokens">
                  {/* <Link
                    href={`https://app.sushi.com/swap?inputCurrency=${daiAddress}&outputCurrency=${ATHER_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        <Trans>Buy on {new String("Sushiswap")}</Trans>
                        <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />
                      </Typography>
                    </Button>
                  </Link> */}

                  {/* <Link
                    href={`https://app.uniswap.org/#/swap?inputCurrency=${fraxAddress}&outputCurrency=${ATHER_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        <Trans>Buy on {new String("Uniswap")}</Trans>
                        <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />
                      </Typography>
                    </Button>
                  </Link> */}

                  { conf.wrappingEnabled && (<Link component={NavLink} to="/wrap" style={{ textDecoration: "none" }}>
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">Wrap sATHER</Typography>
                    </Button>
                  </Link>)}
                </Box>

                {/* <Box component="div" className="data-links">
                  <Divider color="secondary" className="less-margin" />
                  <Link href={`https://dune.xyz/shadow/Atherton-(ATHER)`} target="_blank" rel="noreferrer">
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        Shadow's Dune Dashboard <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />
                      </Typography>
                    </Button>
                  </Link>
                </Box> */}

                {isEthereumAPIAvailable ? (
                  <Box className="add-tokens">
                    {/* <Divider color="secondary" /> */}
                    <p>
                      <Trans>ADD TOKEN TO WALLET</Trans>
                    </p>
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                      {ATHER_ADDRESS && (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={addTokenToWallet("ATHER", ATHER_ADDRESS, address)}
                        >
                          <SvgIcon
                            component={atherTokenImg}
                            viewBox="0 0 32 32"
                            style={{ height: "25px", width: "25px" }}
                          />
                          <Typography variant="body1">ATHER</Typography>
                        </Button>
                      )}
                      {ATHER_USD_ADDRESS && (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={addTokenToWallet("AtherUSD", ATHER_USD_ADDRESS, address)}
                        >
                          <SvgIcon
                            component={atherTokenImg}
                            viewBox="0 0 32 32"
                            style={{ height: "25px", width: "25px" }}
                          />
                          <Typography variant="body1">AtherUSD</Typography>
                        </Button>
                      )}
                      {SATHER_ADDRESS && (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={addTokenToWallet("sATHER", SATHER_ADDRESS, address)}
                        >
                          <SvgIcon
                            component={sAtherTokenImg}
                            viewBox="0 0 100 100"
                            style={{ height: "25px", width: "25px" }}
                          />
                          <Typography variant="body1">sATHER</Typography>
                        </Button>
                      )}
                      {WSATHER_ADDRESS && (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={addTokenToWallet("wsATHER", WSATHER_ADDRESS, address)}
                        >
                          <SvgIcon
                            component={wsAtherTokenImg}
                            viewBox="0 0 180 180"
                            style={{ height: "25px", width: "25px" }}
                          />
                          <Typography variant="body1">wsATHER</Typography>
                        </Button>
                      )}
                    </Box>
                  </Box>
                ) : null}

                {/* <Divider color="secondary" />
                <Link
                  href="https://docs.atherton.finance/using-the-website/unstaking_lp"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="large" variant="contained" color="secondary" fullWidth>
                    <Typography align="left">
                      <Trans>Unstake Legacy LP Token</Trans>
                    </Typography>
                  </Button>
                </Link> */}

              </Paper>
            </Fade>
          );
        }}
      </Popper>
    </Box>
  );
}

export default AtherMenu;
