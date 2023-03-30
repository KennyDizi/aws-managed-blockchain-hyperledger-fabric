import { validateRegion } from "@cdklabs/cdk-hyperledger-fabric-network/lib/utilities";

export function getAvaibilityZones(region: string): string[] {
  validateRegion(region);
  let availabilityZones: string[] = [];
  switch (region) {
    case SUPPORTED_REGIONS.AP_NORTHEAST_1:
      availabilityZones = [
        "ap-northeast-1a",
        "ap-northeast-1b",
        "ap-northeast-1c",
      ];
      break;

    case SUPPORTED_REGIONS.AP_NORTHEAST_2:
      availabilityZones = [
        "ap-northeast-2a",
        "ap-northeast-2b",
        "ap-northeast-2c",
        "ap-northeast-2d",
      ];
      break;

    case SUPPORTED_REGIONS.AP_SOUTHEAST_1:
      availabilityZones = [
        "ap-southeast-1a",
        "ap-southeast-1b",
        "ap-southeast-1c",
      ];
      break;

    case SUPPORTED_REGIONS.EU_WEST_1:
      availabilityZones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"];
      break;

    case SUPPORTED_REGIONS.EU_WEST_2:
      availabilityZones = ["eu-west-2a", "eu-west-2b", "eu-west-2c"];
      break;

    case SUPPORTED_REGIONS.US_EAST_1:
      availabilityZones = [
        "us-east-1a",
        "us-east-1b",
        "us-east-1c",
        "us-east-1d",
        "us-east-1e",
        "us-east-1f",
      ];
      break;
  }

  if (availabilityZones.length === 0)
    throw new Error(`Invalid supported region.`);
  return availabilityZones;
}

export enum SUPPORTED_REGIONS {
  AP_NORTHEAST_1 = "ap-northeast-1",
  AP_NORTHEAST_2 = "ap-northeast-2",
  AP_SOUTHEAST_1 = "ap-southeast-1",
  EU_WEST_1 = "eu-west-1",
  EU_WEST_2 = "eu-west-2",
  US_EAST_1 = "us-east-1",
}
