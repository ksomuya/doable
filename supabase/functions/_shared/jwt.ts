import {
  create,
  verify,
  Header,
  Payload,
} from "https://deno.land/x/djwt@v3.0.2/mod.ts"; // Using latest version

const defaultAlg = "HS256";

// Function to parse simple duration strings like '12h', '1d', '30m'
function parseDurationToSeconds(duration: string): number {
  const value = parseInt(duration.slice(0, -1), 10);
  const unit = duration.slice(-1);
  if (isNaN(value)) return 3600; // Default 1 hour

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return 3600; // Default 1 hour
  }
}

export async function createSignedJWT(
  secret: string,
  payload: Payload,
  expiresIn: string
): Promise<string> {
  const header: Header = {
    alg: defaultAlg,
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseDurationToSeconds(expiresIn);

  payload.iat = now;
  payload.exp = exp;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  return await create(header, payload, key);
}

export async function verifyJWT(
  secret: string,
  token: string
): Promise<Payload | null> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    return await verify(token, key);
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
} 