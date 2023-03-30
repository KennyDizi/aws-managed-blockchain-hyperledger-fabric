import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs/lib/construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import {
  FrameworkVersion,
  HyperledgerFabricNetwork,
  InstanceType,
} from "@cdklabs/cdk-hyperledger-fabric-network";

export class HyperledgerFabricNetworkStack extends cdk.Stack {
  constructor(app: Construct, id: string, props?: cdk.StackProps) {
    super(app, id, props);

    // Define the VPC in us-east-1 region
    const vpcUsEast1 = new ec2.Vpc(
      app,
      `Hyperledger-Fabric-VPC-${this.region}`,
      {
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
      }
    );

    // Define the EKS cluster in us-east-1 region
    const clusterUsEast1 = new eks.Cluster(
      app,
      "Hyperledger-Fabric-Cluster-UsEast1",
      {
        vpc: vpcUsEast1,
        defaultCapacity: 2,
        clusterName: "hyperledger-fabric-cluster-us-east-1",
        version: eks.KubernetesVersion.V1_25,
      }
    );

    new HyperledgerFabricNetwork(this, "Example", {
      networkName: "MyNetwork",
      networkDescription: "This is my Hyperledger Fabric network",
      memberName: "MyMember",
      memberDescription: "This is my Hyperledger Fabric member",
      frameworkVersion: FrameworkVersion.VERSION_2_2,
      proposalDurationInHours: 48,
      thresholdPercentage: 75,
      nodes: [
        {
          availabilityZone: "us-east-1a",
          instanceType: InstanceType.STANDARD5_LARGE,
        },
        {
          availabilityZone: "us-east-1b",
          instanceType: InstanceType.STANDARD5_LARGE,
        },
        {
          availabilityZone: "us-east-1c",
          instanceType: InstanceType.BURSTABLE3_SMALL,
        },
      ],
      users: [
        { userId: "AppUser1", affilitation: "MyMember" },
        { userId: "AppUser2", affilitation: "MyMember.department1" },
      ],
      client: {
        vpc: vpcUsEast1,
      },
    });
  }
}
