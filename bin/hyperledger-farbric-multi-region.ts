#!/usr/bin/env node
import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import { HyperLedgerFarbricNetworkStack } from "../lib/hyperledger-fabric-network-node-stack";

const app = new cdk.App();
const hyperledgerFarbricNetworkStack = new HyperLedgerFarbricNetworkStack(
  app,
  "HyperLedgerFarbricNetworkStack"
);

// Synthesize this stage into a cloud assembly
app.synth();
