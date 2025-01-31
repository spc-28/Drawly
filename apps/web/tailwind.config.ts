import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwindcss-config";

const config: Pick<Config, "content" | "presets"> = {
  content: ["./app/**/*.tsx","./components/**/*.tsx"],
  presets: [sharedConfig],
};

export default config;