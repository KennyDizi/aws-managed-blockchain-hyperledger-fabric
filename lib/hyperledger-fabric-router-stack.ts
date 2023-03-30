import * as cdk from "aws-cdk-lib";
import * as core from "aws-cdk-lib/core";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs/lib/construct";

class MySecondStack extends core.Stack {
  constructor(
    scope: Construct,
    id: string,
    vpcId: string,
    props?: core.StackProps
  ) {
    super(scope, id, props);

    // Use VPC ID from first stack as parameter
    const vpc = ec2.Vpc.fromLookup(this, `${this.region}-VpcId`, {
      vpcId,
    });

    // Create EC2 instance in VPC
    const instance = new ec2.Instance(this, "MyInstance", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: new ec2.AmazonLinuxImage(),
    });
  }
}
