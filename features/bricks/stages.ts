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
      ["drwx", "r-x", "r-x", "2", "root", "root", "4096", "bin"],
      ["drwx", "r-x", "r-x", "3", "root", "root", "4096", "etc"],
      ["drwx", "r-x", "r-x", "6", "root", "root", "4096", "home"],
      ["drwx", "r-x", "r-x", "8", "root", "root", "4096", "var"],
      ["-rw-", "r--", "r--", "1", "root", "root", "1204", "README"],
      ["-rw-", "r--", "r--", "1", "root", "root", "3920", "CONFIG"],
    ],
    words: ["DRWX", "ROOT", "README", "CONFIG", "VAR", "HOME", "ETC", "BIN"],
    brickCount: 18,
    phaseCount: 2,
    specialCount: 16,
    itemWeights: { WIDE: 55, BALL: 20, DOUBLE: 25 },
  },
  ps: {
    stageId: "ps",
    title: "PS / PROCESS SNAPSHOT",
    command: "ps -ef",
    outputRows: [
      ["root", "1", "0", "0", "2025", "?", "00:38:22", "/usr/lib", "systemd", "systemd"],
      ["root", "2", "0", "0", "2025", "?", "00:00:03", "[kthreadd]"],
      ["root", "8", "2", "0", "2025", "?", "00:00:00", "[kworker]", "[events]", "[highpri]"],
      ["root", "12", "2", "0", "2025", "?", "00:00:00", "[rcu_tasks]", "[rude]", "[kthread]"],
      ["root", "15", "2", "0", "2025", "?", "01:01:12", "[rcu]", "[preempt]"],
      ["root", "19", "2", "0", "2025", "?", "00:00:00", "[cpuhp]", "[1]"],
    ],
    words: ["ROOT", "KTHREAD", "KWORKER", "SYSTEMD", "TTY", "TIME", "CMD", "PID", "PPID"],
    brickCount: 22,
    phaseCount: 3,
    specialCount: 16,
    itemWeights: { WIDE: 40, BALL: 25, DOUBLE: 35 },
  },
  top: {
    stageId: "top",
    title: "TOP / PROCESS TABLE",
    command: "top -b -n 1",
    outputRows: [
      ["PID", "USER", "PR", "CPU", "MEM", "COMMAND"],
      ["1", "root", "20", "0.3", "0.1", "systemd"],
      ["221", "root", "20", "0.1", "0.0", "kthreadd"],
      ["732", "ec2", "20", "5.8", "1.2", "node"],
      ["901", "ec2", "20", "3.1", "0.9", "next"],
      ["1023", "ec2", "20", "1.2", "0.6", "cursor"],
      ["1204", "root", "20", "0.8", "0.2", "sshd"],
    ],
    words: ["CPU", "MEM", "SWAP", "TASK", "LOAD", "COMMAND", "SYSTEMD", "RUNNING"],
    brickCount: 24,
    phaseCount: 3,
    specialCount: 32,
    itemWeights: { WIDE: 28, BALL: 44, DOUBLE: 28 },
  },
  grep: {
    stageId: "grep",
    title: "GREP / FILTER",
    command: "grep -n \"error\" app.log",
    outputRows: [
      ["12", ":", "error", "connect", "timeout", "from", "10.0.0.5"],
      ["45", ":", "error", "worker", "queue", "overflow"],
      ["63", ":", "error", "db", "reconnect", "failed"],
      ["74", ":", "error", "token", "validation", "failed"],
      ["88", ":", "error", "panic", "recovered", "from", "runtime"],
      ["102", ":", "error", "rate", "limit", "exceeded"],
    ],
    words: ["ERROR", "FAILED", "TOKEN", "PANIC", "QUEUE", "RUNTIME", "LIMIT", "TIMEOUT"],
    brickCount: 20,
    phaseCount: 4,
    specialCount: 48,
    itemWeights: { WIDE: 25, BALL: 35, DOUBLE: 40 },
  },
  netstat: {
    stageId: "netstat",
    title: "NETSTAT / SOCKET TABLE",
    command: "netstat -anp tcp",
    outputRows: [
      ["Proto", "Recv-Q", "Send-Q", "Local", "Address", "Foreign", "Address", "State"],
      ["tcp", "0", "0", "127.0.0.1", ":5432", "0.0.0.0", ":*", "LISTEN"],
      ["tcp", "0", "0", "0.0.0.0", ":22", "0.0.0.0", ":*", "LISTEN"],
      ["tcp", "0", "0", "10.0.2.15", ":443", "10.0.1.44", ":51322", "ESTAB", "LISHED"],
      ["tcp", "0", "0", "10.0.2.15", ":443", "10.0.1.91", ":52310", "TIME", "_WAIT"],
      ["tcp", "0", "0", "10.0.2.15", ":80", "10.0.1.14", ":59200", "CLOSE", "_WAIT"],
    ],
    words: ["LISTEN", "TCP", "UDP", "PORT", "STATE", "LOCAL", "FOREIGN", "ESTABLISHED"],
    brickCount: 26,
    phaseCount: 5,
    specialCount: 64,
    itemWeights: { WIDE: 20, BALL: 48, DOUBLE: 32 },
  },
};

