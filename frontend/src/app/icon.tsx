import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
          borderRadius: "6px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            width: 16,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#f8fafc",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 14.5,
            width: 8,
            height: 3.5,
            borderRadius: 2,
            backgroundColor: "#ede9fe",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 18,
            width: 19,
            height: 8,
            borderRadius: 3,
            backgroundColor: "#23123f",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            width: 14,
            height: 2,
            borderRadius: 2,
            backgroundColor: "#3b1d68",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
