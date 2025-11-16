export default function Skeleton({ height = 200, radius = 10 }) {
    return (
        <div
            style={{
                height,
                borderRadius: radius,
                background:
                    "linear-gradient(90deg,#ececec 25%,#f5f5f5 37%,#ececec 63%)",
                backgroundSize: "400% 100%",
                animation: "shimmer 1.2s ease-in-out infinite",
            }}
        />
    );
}
