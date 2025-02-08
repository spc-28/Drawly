const usedColors = new Set();

export function getRandomHexColor() {
  if (usedColors.size >= 16777216) {
    throw new Error("All possible colors have been used.");
  }

  let color;
  do {
    color =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
  } while (usedColors.has(color));

  usedColors.add(color);
  return color;
}


export function rgbaToHex(r:any, g:any, b:any, a = 1) {
  const hex: string = [r, g, b].map(val =>
    val.toString(16).padStart(2, '0')
  ).join('');

  const alphaHex: string = Math.round(a * 255).toString(16).padStart(2, '0');

  return a === 1 ? `#${hex}` : `#${hex}${alphaHex}`;
}
