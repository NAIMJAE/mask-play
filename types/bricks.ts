export type BricksSkin = "cmd";

export type BricksItemType = "WIDEBAR" | "PLUSBALL" | "FAST";
export type BricksStageId = "ls" | "ps" | "top" | "grep" | "netstat";

export interface BricksSetupConfig {
  skin: BricksSkin;
  stage: BricksStageId;
}

