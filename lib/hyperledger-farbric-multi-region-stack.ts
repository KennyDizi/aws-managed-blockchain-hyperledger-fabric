import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2peer from "aws-cdk-lib/aws-ec2-peer";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs/lib/construct";

export class HyperLedgerFarbricMultiRegionStack extends cdk.Stack {
  constructor(app: Construct, id: string, props?: cdk.StackProps) {
    super(app, id, props);

    // Define the VPC in us-east-1 region
    const vpcUsEast1 = new ec2.Vpc(app, "Hyperledger-Fabric-VPC-UsEast1", {
      maxAzs: 2,
      cidr: "10.0.0.0/16",
      natGateways: 3,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "Public",
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          name: "Private",
        },
      ],
    });

    // Define the VPC in us-west-2 region
    const vpcUsWest2 = new ec2.Vpc(app, "Hyperledger-Fabric-VPC-UsWest2", {
      maxAzs: 3,
      cidr: "10.0.0.0/16",
      natGateways: 1,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "Public",
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          name: "Private",
        },
      ],
    });

    // Define the VPC in eu-west-1 region
    const vpcEuWest1 = new ec2.Vpc(app, "Hyperledger-Fabric-VPC-EuWest1", {
      maxAzs: 3,
      cidr: "10.0.0.0/16",
      natGateways: 1,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "Public",
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          name: "Private",
        },
      ],
    });
  }
}
