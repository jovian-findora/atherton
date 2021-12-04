import { Button } from "@material-ui/core";
import { enforceNetwork, useWeb3Context } from "src/hooks/web3Context";
import { Trans } from "@lingui/macro";

const ConnectButton = () => {
  const { connect } = useWeb3Context();
  const switchNetworkAndConnect = async () => {
    await enforceNetwork();
    connect();
  };
  return (
    <Button variant="contained" color="primary" className="connect-button" onClick={switchNetworkAndConnect}>
      <Trans>Connect Wallet</Trans>
    </Button>
  );
};

export default ConnectButton;
