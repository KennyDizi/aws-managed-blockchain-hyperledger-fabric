import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs/lib/construct";
import { DefaultCapacityType } from "aws-cdk-lib/aws-eks";
import {
  FrameworkVersion,
  HyperledgerFabricNetwork,
  InstanceType,
} from "@cdklabs/cdk-hyperledger-fabric-network";

export class HyperLedgerFarbricMultiRegionStack extends cdk.Stack {
  constructor(app: Construct, id: string, props?: cdk.StackProps) {
    super(app, id, props);

    // Define the VPC in us-east-1 region
    const vpcUsEast1 = new ec2.Vpc(app, "Hyperledger-Fabric-VPC-UsEast1", {
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

    // Define the EKS cluster in us-west-2 region
    const clusterUsWest2 = new eks.Cluster(
      app,
      "Hyperledger-Fabric-Cluster-UsWest2",
      {
        vpc: vpcUsWest2,
        defaultCapacity: 2,
        defaultCapacityType: DefaultCapacityType.EC2,
        clusterName: "hyperledger-fabric-cluster-us-west-2",
        version: eks.KubernetesVersion.V1_25,
        region: "us-west-2",
      }
    );

    // Define the EKS cluster in eu-west-1 region
    const clusterEuWest1 = new eks.Cluster(
      app,
      "Hyperledger-Fabric-Cluster-EuWest1",
      {
        vpc: vpcEuWest1,
        defaultCapacity: 2,
        clusterName: "hyperledger-fabric-cluster-eu-west-1",
        version: eks.KubernetesVersion.V1_25,
        region: "eu-west-1",
      }
    );

    new HyperledgerFabricNetwork(this, "Example", {
      networkName: "MyNetwork",
      networkDescription: "This is my Hyperledger Fabric network",
      memberName: "MyMember",
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
          availabilityZone: "",
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
