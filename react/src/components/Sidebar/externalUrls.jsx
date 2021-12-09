import { ReactComponent as ForumIcon } from "../../assets/icons/forum.svg";
import { ReactComponent as GovIcon } from "../../assets/icons/governance.svg";
import { ReactComponent as DocsIcon } from "../../assets/icons/docs.svg";
import { ReactComponent as FeedbackIcon } from "../../assets/icons/feedback.svg";
import { SvgIcon } from "@material-ui/core";
import { Trans } from "@lingui/macro";

const externalUrls = [
  // {
  //   title: <Trans>Forum</Trans>,
  //   url: "https://forum.atherton.finance/",
  //   icon: <SvgIcon color="primary" component={ForumIcon} />,
  // },
  // {
  //   title: <Trans>Governance</Trans>,
  //   url: "https://vote.atherton.finance/",
  //   icon: <SvgIcon color="primary" component={GovIcon} />,
  // },
  {
    title: <Trans>Docs</Trans>,
    url: "https://docs.atherton.finance/",
    icon: <SvgIcon color="primary" component={DocsIcon} />,
  },
  // {
  //   title: "Feedback",
  //   url: "https://atherton.canny.io/",
  //   icon: <SvgIcon color="primary" component={FeedbackIcon} />,
  // },
];

export default externalUrls;
