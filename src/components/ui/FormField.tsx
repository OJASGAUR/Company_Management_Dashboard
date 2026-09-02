import React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ className = "", error, ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border ${
        error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
      } bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
      {...props}
    />
  )
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export function Select({ className = "", error, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none rounded-xl border ${
          error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
        } bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-all focus:ring-2 disabled:bg-slate-50 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ className = "", error, ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-xl border ${
        error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
      } bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
      {...props}
    />
  )
}

interface FormFieldProps {
  label: string
  error?: string
  description?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({
  label,
  error,
  description,
  required,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      </div>
      {children}
      {description && <p className="text-xs text-slate-400">{description}</p>}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}
