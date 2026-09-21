import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VíaSur — Directorio de servicios locales del sur de Costa Rica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "linear-gradient(135deg, #0a4f9c 0%, #0a1830 100%)",
        }}
      >
        <svg width="240" height="240" viewBox="0 0 512 512">
          <g
            transform="translate(256 216)"
            fill="none"
            stroke="#ffffff"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M -152 96 L -68 -72 L -8 48 L 44 -48 L 152 96" />
          </g>
          <g stroke="#3b9eff" strokeWidth="18" strokeLinecap="round" fill="none">
            <path
              d="M 76 356 Q 140 316 204 356 T 332 356 T 436 356"
              opacity="0.9"
            />
            <path
              d="M 76 408 Q 140 372 204 408 T 332 408 T 436 408"
              opacity="0.5"
            />
          </g>
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 48,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            VíaSur
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#d9ebff",
              marginTop: 16,
            }}
          >
            Servicios locales del sur de Costa Rica
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
