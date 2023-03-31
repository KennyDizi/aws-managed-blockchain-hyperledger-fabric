import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs/lib/construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as core from "aws-cdk-lib/core";
import {
  FrameworkVersion,
  HyperledgerFabricNetwork,
  HyperledgerFabricNodeProps,
  InstanceType,
} from "@cdklabs/cdk-hyperledger-fabric-network";
import { HyperledgerFabricNetworkStackProps } from "./hyperledger-fabric-network-node-stack-props";
import { getAvaibilityZones } from "../utilities/get-avaibility-zone";

export class HyperLedgerFarbricNetworkStack extends cdk.Stack {
  constructor(
    app: Construct,
    id: string,
    props?: HyperledgerFabricNetworkStackProps
  ) {
    super(app, id, props);

    const availabilityZones = getAvaibilityZones(this.region);
    const maxAzs = availabilityZones.length;

    // Define the VPC
    const specificRegionVPC = new ec2.Vpc(
      app,
      `hyperledger-fabric-vpc-${this.region}`,
      {
        maxAzs: maxAzs,
        cidr: "10.0.0.0/16",
        natGateways: 1,
        subnetConfiguration: [
          {
            subnetType: ec2.SubnetType.PUBLIC,
            name: "Public",
            cidrMask: 24,
          },
          {
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            name: "Private",
            cidrMask: 24,
          },
        ],
        availabilityZones: availabilityZones,
      }
    );

    // Define the EKS cluster
    const specificRegionEKSCluster = new eks.Cluster(
      app,
      `hyperledger-fabric-cluster-${this.region}`,
      {
        vpc: specificRegionVPC,
        defaultCapacity: 1,
        clusterName: `hyperledger-fabric-cluster-${this.region}`,
        version: eks.KubernetesVersion.V1_25,
      }
    );

    // Build Hyperledger Fabric Nodes
    const numberOfNodePerAZ = props?.numberOfNodePerAZ ?? 1;
    const hyperledgerFabricNodes: HyperledgerFabricNodeProps[] = Array.from(
      { length: availabilityZones.length * numberOfNodePerAZ },
      (_, i) => ({
        availabilityZone: availabilityZones[Math.floor(i / numberOfNodePerAZ)],
        instanceType: props?.instanceType ?? InstanceType.BURSTABLE3_SMALL,
        enableChaincodeLogging: true,
        enableNodeLogging: true,
      })
    );

    // Build Hyperledger Fabric Network
    new HyperledgerFabricNetwork(this, "HyperledgerFabricNetwork", {
      networkName: `hyperledger-fabric-${this.region}-network`,
      networkDescription: `This is ${this.region} Hyperledger Fabric Network.`,
      memberName: `hyperledger-fabric-${this.region}-member`,
      memberDescription: `This is ${this.region} Hyperledger Fabric Member.`,
      frameworkVersion: FrameworkVersion.VERSION_2_2,
      proposalDurationInHours: props?.proposalDurationInHours ?? 48,
      thresholdPercentage: props?.thresholdPercentage ?? 75,
      nodes: hyperledgerFabricNodes,
      users: [
        { userId: "AppUser1", affilitation: "MyMember" },
        { userId: "AppUser2", affilitation: "MyMember.department1" },
      ],
      client: {
        vpc: specificRegionVPC,
      },
    });

    // Output VPC ID
    new core.CfnOutput(this, "VpcId", {
      value: specificRegionVPC.vpcId,
      exportName: `${this.region}-VpcId`,
    });

    // Output EKS cluster name
    new core.CfnOutput(this, "ClusterName", {
      value: specificRegionEKSCluster.clusterName,
      exportName: `${this.region}-EKSClusterName`,
    });

    // Output EKS cluster endpoint
    new core.CfnOutput(this, "ClusterEndpoint", {
      value: specificRegionEKSCluster.clusterEndpoint,
      exportName: `${this.region}-EKSClusterEndpoint`,
    });
  }
}
