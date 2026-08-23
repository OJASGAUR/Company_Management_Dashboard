const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function requiredString(value: FormDataEntryValue | null, field: string, maxLength = 500) {
  if (typeof value !== "string") throw new Error(`${field} is required`)
  const result = value.trim()
  if (!result) throw new Error(`${field} is required`)
  if (result.length > maxLength) throw new Error(`${field} is too long`)
  return result
}

export function optionalString(value: FormDataEntryValue | null, maxLength = 500) {
  if (value == null || value === "") return null
  if (typeof value !== "string") throw new Error("Invalid text value")
  const result = value.trim()
  if (result.length > maxLength) throw new Error("Text value is too long")
  return result || null
}

export function email(value: FormDataEntryValue | null) {
  const result = requiredString(value, "Email", 254).toLowerCase()
  if (!EMAIL_RE.test(result)) throw new Error("Invalid email address")
  return result
}

export function date(value: FormDataEntryValue | null, field: string) {
  const raw = requiredString(value, field, 64)
  const result = new Date(raw)
  if (Number.isNaN(result.getTime())) throw new Error(`Invalid ${field.toLowerCase()}`)
  return result
}

export function optionalDate(value: FormDataEntryValue | null, field: string) {
  if (value == null || value === "") return null
  return date(value, field)
}

export function enumValue<T extends string>(value: FormDataEntryValue | null, field: string, allowed: readonly T[]) {
  const result = requiredString(value, field, 64) as T
  if (!allowed.includes(result)) throw new Error(`Invalid ${field.toLowerCase()}`)
  return result
}

export function id(value: string, field = "ID") {
  const result = value?.trim()
  if (!result || result.length > 100 || /[\s]/.test(result)) throw new Error(`Invalid ${field}`)
  return result
}
