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
