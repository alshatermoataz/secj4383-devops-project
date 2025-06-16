/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['firebasestorage.googleapis.com'], // Add your image domains here
  },
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:3002",
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCKW1nL8OHzmnh_SZzZGzMeA01WjTe001E",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "altf4riends-sc-3fd4a.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "altf4riends-sc-3fd4a",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "altf4riends-sc-3fd4a.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "177795751044",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:177795751044:web:56767645540f7ec325b6d1",
  },
  // Enable SWC minification
  swcMinify: true,
  // Configure experimental features
  experimental: {
    esmExternals: false,
  },
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add specific handling for undici
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'ecmascript',
              jsx: false,
              dynamicImport: true,
              privateMethod: true,
              functionBind: true,
              exportDefaultFrom: true,
              exportNamespaceFrom: true,
              decorators: true,
              decoratorsBeforeExport: true,
              topLevelAwait: true,
              importMeta: true,
            },
            transform: {
              legacyDecorator: true,
              decoratorMetadata: true,
            },
            target: 'es2020',
          },
        },
      },
    });
    return config;
  },
};

module.exports = nextConfig; 