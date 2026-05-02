const isGithubPages = process.env.GITHUB_PAGES === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGithubPages ? 'export' : undefined,
  trailingSlash: true,
  basePath: isGithubPages ? '/ai-assistant' : '',
  assetPrefix: isGithubPages ? '/ai-assistant' : '',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" }
    ]
  }
};

export default nextConfig;
