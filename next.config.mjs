const nextConfig = {
    async redirects() {
        return [
            {
                source: "/",
                // I dont want to use the root page
                destination: "/posts",
                permanent: true,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.pravatar.cc",
                port: "",
                pathname: "/**",
            },
        ],
    },
    reactStrictMode: false,
};

export default nextConfig;
