import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs/lib/construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import {
  FrameworkVersion,
  HyperledgerFabricNetwork,
  HyperledgerFabricNodeProps,
  InstanceType,
} from "@cdklabs/cdk-hyperledger-fabric-network";
import { HyperledgerFabricNetworkStackProps } from "./hyperledger-fabric-network-stack-props";
import { getAvaibilityZone } from "../utilities/get-avaibility-zone";

export class HyperledgerFabricNetworkStack extends cdk.Stack {
  constructor(
    app: Construct,
    id: string,
    props?: HyperledgerFabricNetworkStackProps
  ) {
    super(app, id, props);

    // Define the VPC in us-east-1 region
    const specificRegionVPC = new ec2.Vpc(
      app,
      `hyperledger-fabric-vpc-${this.region}`,
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
    const availabilityZones = getAvaibilityZone(this.region);
    const numberOfNodePerAZ = props?.numberOfNodePerAZ ?? 1;
    const hyperledgerFabricNodes: HyperledgerFabricNodeProps[] = [];
    availabilityZones.map((availabilityZone) => {
      for (let i = 0; i < numberOfNodePerAZ; i++) {
        hyperledgerFabricNodes.push({
          availabilityZone: availabilityZone,
          instanceType: props?.instanceType ?? InstanceType.BURSTABLE3_SMALL,
          enableChaincodeLogging: true,
          enableNodeLogging: true,
        });
      }
    });

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
  }
}
