export async function findOptimalFontSize(
  node: TextNode,
  text: string,
  targetWidth: number,
  targetHeight: number,
  options?: {
    minFontSize?: number;
    maxFontSize?: number;
  }
): Promise<number> {
  const fontName = node.fontName as FontName;
  await figma.loadFontAsync(fontName);

  const minFontSize = Math.max(1, options?.minFontSize ?? 4);
  const maxFontSize = Math.max(minFontSize + 1, options?.maxFontSize ?? 150);

  const measureHeight = (size: number): number => {
    const probe = node.clone();
    try {
      probe.visible = false;
      probe.textAutoResize = 'NONE';
      probe.resizeWithoutConstraints(targetWidth, targetHeight);
      probe.fontName = fontName;
      probe.fontSize = size;
      probe.characters = text;
      probe.textAutoResize = 'HEIGHT';
      return probe.height;
    } finally {
      probe.remove();
    }
  };

  let low = minFontSize;
  let high = maxFontSize;
  let best: number | null = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const measuredHeight = measureHeight(mid);

    if (measuredHeight <= targetHeight) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (best === null) {
    return minFontSize;
  }

  return best;
}
