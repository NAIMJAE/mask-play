import type { BricksItemType, BricksStageId } from "@/types/bricks";

export interface StageBlueprint {
  stageId: BricksStageId;
  title: string;
  command: string;
  outputRows: string[][];
  words: string[];
  brickCount: number;
  phaseCount: number;
  specialCount: number;
  itemWeights: Record<BricksItemType, number>;
}

export const WORD_BANK_BY_LENGTH: Record<number, string[]> = {
  4: [
    "HEAP", "NODE", "PORT", "TASK", "LOOP", "PIPE", "HOOK", "BYTE", "PING", "SYNC",
  ],
  5: [
    "STACK", "CACHE", "FAULT", "TOKEN", "ROUTE", "PATCH", "SHELL", "INPUT", "TRACE", "ALIGN",
  ],
  6: [
    "SYSTEM", "BUFFER", "MODULE", "ACCESS", "CLIENT", "SERVER", "SOCKET", "SCRIPT", "MEMORY", "STATUS",
  ],
  7: [
    "PROCESS", "THREADS", "KERNELS", "ROUTERS", "SECURED", "HANDLER", "PACKETS", "MONITOR", "NETWORK",
  ],
  8: [
    "DEADLOCK", "TIMEOUTS", "PIPELINE", "REGISTRY", "GRAPHICS", "REQUESTS", "RESPONSE", "CODEBASE",
  ],
};

export const STAGE_ORDER: BricksStageId[] = ["ls", "ps", "top", "grep", "netstat"];

export const STAGE_BLUEPRINTS: Record<BricksStageId, StageBlueprint> = {
  ls: {
    stageId: "ls",
    title: "LS / FILE TREE",
    command: "ls -la /var/log",
    outputRows: [
      ["drwxr-xr-x", "2", "root", "root", "4096", "bin"],
      ["drwxr-xr-x", "3", "root", "root", "4096", "etc"],
      ["drwxr-xr-x", "6", "root", "root", "4096", "home"],
      ["drwxr-xr-x", "8", "root", "root", "4096", "var"],
      ["-rw-r--r--", "1", "root", "root", "1204", "README"],
      ["-rw-r--r--", "1", "root", "root", "3920", "CONFIG"],
    ],
    words: ["DRWX", "ROOT", "README", "CONFIG", "VAR", "HOME", "ETC", "BIN"],
    brickCount: 18,
    phaseCount: 2,
    specialCount: 1,
    itemWeights: { WIDEBAR: 55, PLUSBALL: 20, SLOWMO: 25 },
  },
  ps: {
    stageId: "ps",
    title: "PS / PROCESS SNAPSHOT",
    command: "ps -ef",
    outputRows: [
      ["root", "1", "0", "0", "2025", "?", "00:38:22", "/usr/lib/systemd/systemd"],
      ["root", "2", "0", "0", "2025", "?", "00:00:03", "[kthreadd]"],
      ["root", "8", "2", "0", "2025", "?", "00:00:00", "[kworker/0:0H-events_highpri]"],
      ["root", "12", "2", "0", "2025", "?", "00:00:00", "[rcu_tasks_rude_kthread]"],
      ["root", "15", "2", "0", "2025", "?", "01:01:12", "[rcu_preempt]"],
      ["root", "19", "2", "0", "2025", "?", "00:00:00", "[cpuhp/1]"],
    ],
    words: ["ROOT", "KTHREAD", "KWORKER", "SYSTEMD", "TTY", "TIME", "CMD", "PID", "PPID"],
    brickCount: 22,
    phaseCount: 3,
    specialCount: 1,
    itemWeights: { WIDEBAR: 40, PLUSBALL: 25, SLOWMO: 35 },
  },
  top: {
    stageId: "top",
    title: "TOP / CPU VIEW",
    command: "top -b -n 1",
    outputRows: [
      ["Tasks:", "182", "total,", "2", "running,", "180", "sleeping"],
      ["%Cpu(s):", "9.2", "us,", "3.1", "sy,", "0.0", "ni,", "87.7", "id"],
      ["MiB", "Mem", ":", "15721.3", "total,", "4228.6", "free,", "3310.1", "used"],
      ["MiB", "Swap:", "2048.0", "total,", "1998.2", "free,", "49.8", "used"],
      ["PID", "USER", "PR", "NI", "VIRT", "RES", "SHR", "S", "%CPU", "%MEM", "TIME+", "COMMAND"],
      ["1", "root", "20", "0", "171864", "11800", "8460", "S", "0.3", "0.1", "0:38.22", "systemd"],
    ],
    words: ["CPU", "MEM", "SWAP", "TASK", "LOAD", "COMMAND", "SYSTEMD", "RUNNING"],
    brickCount: 24,
    phaseCount: 3,
    specialCount: 2,
    itemWeights: { WIDEBAR: 28, PLUSBALL: 44, SLOWMO: 28 },
  },
  grep: {
    stageId: "grep",
    title: "GREP / FILTER",
    command: "grep -n \"error\" app.log",
    outputRows: [
      ["12:error", "connect", "timeout", "from", "10.0.0.5"],
      ["45:error", "worker", "queue", "overflow"],
      ["63:error", "db", "reconnect", "failed"],
      ["74:error", "token", "validation", "failed"],
      ["88:error", "panic", "recovered", "from", "runtime"],
      ["102:error", "rate", "limit", "exceeded"],
    ],
    words: ["ERROR", "FAILED", "TOKEN", "PANIC", "QUEUE", "RUNTIME", "LIMIT", "TIMEOUT"],
    brickCount: 20,
    phaseCount: 4,
    specialCount: 3,
    itemWeights: { WIDEBAR: 25, PLUSBALL: 35, SLOWMO: 40 },
  },
  netstat: {
    stageId: "netstat",
    title: "NETSTAT / SOCKET TABLE",
    command: "netstat -anp tcp",
    outputRows: [
      ["Proto", "Recv-Q", "Send-Q", "Local", "Address", "Foreign", "Address", "State"],
      ["tcp", "0", "0", "127.0.0.1:5432", "0.0.0.0:*", "LISTEN"],
      ["tcp", "0", "0", "0.0.0.0:22", "0.0.0.0:*", "LISTEN"],
      ["tcp", "0", "0", "10.0.2.15:443", "10.0.1.44:51322", "ESTABLISHED"],
      ["tcp", "0", "0", "10.0.2.15:443", "10.0.1.91:52310", "TIME_WAIT"],
      ["tcp", "0", "0", "10.0.2.15:80", "10.0.1.14:59200", "CLOSE_WAIT"],
    ],
    words: ["LISTEN", "TCP", "UDP", "PORT", "STATE", "LOCAL", "FOREIGN", "ESTABLISHED"],
    brickCount: 26,
    phaseCount: 5,
    specialCount: 4,
    itemWeights: { WIDEBAR: 20, PLUSBALL: 48, SLOWMO: 32 },
  },
};

