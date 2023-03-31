#!/usr/bin/env node
import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import { HyperLedgerFarbricNetworkStack } from "../lib/hyperledger-fabric-network-node-stack";
import { InstanceType } from "@cdklabs/cdk-hyperledger-fabric-network";

const app = new cdk.App();
const hyperledgerFarbricNetworkStack = new HyperLedgerFarbricNetworkStack(
  app,
  "HyperLedgerFarbricNetworkStack",
  {
    numberOfNodePerAZ: 1,
    instanceType: InstanceType.BURSTABLE3_SMALL,
    proposalDurationInHours: 48,
    thresholdPercentage: 75,
  }
);
hyperledgerFarbricNetworkStack.vpcID;

// Synthesize this stage into a cloud assembly
app.synth();
