import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: { formats: ['image/avif', 'image/webp'] },
};

export default withBotId(nextConfig);
