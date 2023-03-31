import "source-map-support/register";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs/lib/construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";
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
  public vpcID: string | undefined;

  constructor(
    app: Construct,
    id: string,
    props: HyperledgerFabricNetworkStackProps
  ) {
    super(app, id, props);

    /**
     * Configurable parameters to be passed to CloudFormation stack
     * upon deployment
     */
    const keyPair = new cdk.CfnParameter(this, "keypair", {
      type: "String",
      description: "EC2 Key Pair Name",
    });
    const sshSafeIp = new cdk.CfnParameter(this, "safeip", {
      type: "String",
      description: "IP Address with /32 suffix to Allow SSH Connections from",
    });
    const availabilityZones = getAvaibilityZones(this.region);

    // Define the VPC
    const specificRegionVPC = new ec2.Vpc(
      app,
      `hyperledger-fabric-vpc-${this.region}`,
      {
        maxAzs: availabilityZones.length,
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

    /**
     * Security Group Allowing SSH Connections from specific IP
     * along with all TCP traffic among EC2s within VPC
     */
    const ec2SecurityGroup = new ec2.SecurityGroup(
      this,
      `${this.region}-ec2-ssh-security-group`,
      {
        vpc: specificRegionVPC,
        description:
          "Allow SSH (TCP port 22) from Anywhere and All TCP within VPC",
        allowAllOutbound: true,
      }
    );
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.ipv4(sshSafeIp.valueAsString),
      ec2.Port.tcp(22),
      "Allow SSH from Specific IP"
    );
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.ipv4(specificRegionVPC.vpcCidrBlock),
      ec2.Port.allTcp(),
      "Allow all TCP within VPC"
    );

    // Build Hyperledger Fabric Nodes
    const numberOfNodePerAZ = props.numberOfNodePerAZ ?? 1;
    const hyperledgerFabricNodes: HyperledgerFabricNodeProps[] = [];
    availabilityZones.map((availabilityZone) => {
      for (let i = 0; i < numberOfNodePerAZ; i++) {
        hyperledgerFabricNodes.push({
          availabilityZone: availabilityZone,
          instanceType: props.instanceType ?? InstanceType.BURSTABLE3_SMALL,
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
      proposalDurationInHours: props.proposalDurationInHours ?? 48,
      thresholdPercentage: props.thresholdPercentage ?? 75,
      nodes: hyperledgerFabricNodes,
      enrollAdmin: true,
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
      exportName: `${this.region}-${id}-VpcId`,
    });

    this.vpcID = specificRegionVPC.vpcId;
  }
}
