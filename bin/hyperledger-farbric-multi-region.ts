#!/usr/bin/env node
import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import { HyperLedgerFarbricMultiRegionStack } from "../lib/hyperledger-farbric-multi-region-stack";

const app = new cdk.App();
new HyperLedgerFarbricMultiRegionStack(
  app,
  "HyperLedgerFarbricMultiRegionStack"
);
