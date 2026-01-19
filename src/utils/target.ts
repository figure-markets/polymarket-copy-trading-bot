export let copyTargetAddress: string = "";

export function setCopyTarget(proxy: string): void {
  copyTargetAddress = proxy;
}

export function getCopyTarget(): string {
  return copyTargetAddress;
}
