import * as core from "aws-cdk-lib/core";
import { InstanceType } from "@cdklabs/cdk-hyperledger-fabric-network";

export interface HyperledgerFabricNetworkStackProps extends core.StackProps {
  numberOfNodePerAZ: number;
  instanceType: InstanceType;
}
