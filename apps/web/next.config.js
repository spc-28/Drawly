import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Pin the workspace root so Turbopack ignores stray lockfiles outside the repo.
    turbopack: {
        root: path.join(__dirname, "..", ".."),
    },
};

export default nextConfig;
