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
  // Convert RGB to Hex
  let hex = [r, g, b].map(val =>
    val.toString(16).padStart(2, '0')
  ).join('');

  // Convert alpha to Hex (optional, if you need opacity in the hex code)
  let alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');

  // If alpha is 1 (fully opaque), you can omit the alpha channel
  return a === 1 ? `#${hex}` : `#${hex}${alphaHex}`;
}
