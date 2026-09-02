import React from "react"
import { Badge } from "./Badge"

interface StatusBadgeProps {
  status: string
  className?: string
  size?: "sm" | "md"
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase().replace(/\s+/g, "_")

  let variant: "default" | "primary" | "success" | "warning" | "danger" | "info" = "default"

  switch (normalized) {
    case "PRESENT":
    case "APPROVED":
    case "COMPLETED":
    case "PAID":
    case "ACTIVE":
    case "ASSIGNED":
    case "ENABLED":
      variant = "success"
      break

    case "LATE":
    case "PENDING":
    case "IN_PROGRESS":
    case "IN_REVIEW":
    case "PLANNING":
    case "UNPAID":
      variant = "warning"
      break

    case "ABSENT":
    case "REJECTED":
    case "OVERDUE":
    case "CRITICAL":
    case "DISABLED":
    case "REPAIR":
    case "FAILED":
      variant = "danger"
      break

    case "HIGH":
      variant = "warning"
      break

    case "TODO":
    case "MEDIUM":
    case "LOW":
      variant = "default"
      break

    case "CLIENT":
    case "AVAILABLE":
      variant = "info"
      break

    default:
      variant = "default"
  }

  const label = status ? status.replace(/_/g, " ") : "Unknown"

  return (
    <Badge variant={variant} size={size} dot className={className}>
      {label}
    </Badge>
  )
}
