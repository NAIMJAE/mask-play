export type BricksSkin = "cmd";

export type BricksItemType = "WIDEBAR" | "PLUSBALL" | "SLOWMO";
export type BricksStageId = "ls" | "ps" | "top" | "grep" | "netstat";

export interface BricksSetupConfig {
  skin: BricksSkin;
  stage: BricksStageId;
}

