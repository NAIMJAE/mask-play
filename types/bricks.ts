export type BricksSkin = "cmd";

export type BricksItemType = "WIDE" | "BALL" | "DOUBLE";
export type BricksStageId = "ls" | "ps" | "top" | "grep" | "netstat";

export interface BricksSetupConfig {
  skin: BricksSkin;
  stage: BricksStageId;
}

