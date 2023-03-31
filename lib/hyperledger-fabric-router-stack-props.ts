import * as core from "aws-cdk-lib/core";

export interface HyperLedgerFabricRouterStackProps extends core.StackProps {
  vpcIDs: string[];
}
