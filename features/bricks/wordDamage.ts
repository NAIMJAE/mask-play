export function createWordPhases(base: string, phaseCount: number): string[] {
  const phases: string[] = [base];
  if (phaseCount <= 1) return phases;
  const alphaIndexes = getAlphaIndexes(base);
  if (alphaIndexes.length <= 1) return phases;
  const order = [...alphaIndexes];
  shuffleInPlace(order);
  const maxDamage = alphaIndexes.length - 1;
  for (let i = 1; i < phaseCount; i++) {
    const damageCount = Math.min(maxDamage, i);
    phases.push(applyDamageByOrder(base, order, damageCount));
  }
  return phases;
}

export function createSpecialWordPhases(
  base: string,
  phaseCount: number,
  itemLabel: string,
): string[] {
  const phases: string[] = [base];
  if (phaseCount <= 1) return [itemLabel];
  const alphaIndexes = getAlphaIndexes(base);
  if (alphaIndexes.length <= 1) return [base, itemLabel];
  const order = [...alphaIndexes];
  shuffleInPlace(order);
  const maxDamage = alphaIndexes.length - 1;
  for (let i = 1; i < phaseCount - 1; i++) {
    const damageCount = Math.min(maxDamage, i);
    phases.push(applyDamageByOrder(base, order, damageCount));
  }
  phases.push(itemLabel);
  return phases;
}

function getAlphaIndexes(base: string): number[] {
  return base
    .split("")
    .map((ch, idx) => (/^[A-Z]$/.test(ch) ? idx : -1))
    .filter((idx) => idx >= 0);
}

function applyDamageByOrder(base: string, order: number[], damageCount: number): string {
  const chars = base.split("");
  for (let i = 0; i < damageCount; i++) {
    const idx = order[i];
    if (idx != null) chars[idx] = "_";
  }
  return chars.join("");
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

