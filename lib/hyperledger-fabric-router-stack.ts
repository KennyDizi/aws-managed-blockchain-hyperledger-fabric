import * as core from "aws-cdk-lib/core";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs/lib/construct";
import { HyperLedgerFabricRouterStackProps } from "./hyperledger-fabric-router-stack-props";

export class HyperLedgerFabricRouterStack extends core.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: HyperLedgerFabricRouterStackProps
  ) {
    super(scope, id, props);

    // Use VPC ID from first stack as parameter
    const vpcs = props.vpcIDs.map((vpcID) =>
      ec2.Vpc.fromLookup(this, `${this.region}-VpcId-${vpcID}`, {
        vpcId: vpcID,
      })
    );
    const firstVPC = vpcs[0];

    // Define the Route53 private hosted zone
    const zone = new route53.PrivateHostedZone(
      scope,
      "hyperledger-fabric-zone",
      {
        zoneName: "hyperledger-fabric.local",
        vpc: firstVPC,
      }
    );
  }
}
