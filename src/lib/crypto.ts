import crypto from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12

function getKey() {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY
  if (!raw) throw new Error("CREDENTIAL_ENCRYPTION_KEY is not configured")
  const key = Buffer.from(raw, "hex")
  if (key.length !== 32) throw new Error("CREDENTIAL_ENCRYPTION_KEY must be 32 bytes encoded as hex")
  return key
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`
}

export function decryptSecret(value: string) {
  const [ivPart, tagPart, encryptedPart] = value.split(".")
  if (!ivPart || !tagPart || !encryptedPart) throw new Error("Invalid encrypted value")
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivPart, "base64url"))
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"))
  return Buffer.concat([decipher.update(Buffer.from(encryptedPart, "base64url")), decipher.final()]).toString("utf8")
}
