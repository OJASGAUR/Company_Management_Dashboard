"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SlidingLoginPage() {
  const [isEmployee, setIsEmployee] = useState(true)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px]" />

      <div className="relative overflow-hidden w-full max-w-[1024px] min-h-[680px] bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1),0_15px_15px_rgba(0,0,0,0.05)] border border-slate-100 z-10 flex">
        
        {/* Left Side: Employee Login Form */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isEmployee ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-10 -translate-x-[20%]'}`}
        >
          <LoginForm type="employee" />
        </div>

        {/* Right Side: Admin Login Form */}
        <div 
          className={`absolute top-0 right-0 h-full w-1/2 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isEmployee ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-10 translate-x-[20%]'}`}
        >
          <LoginForm type="admin" />
        </div>

        {/* Sliding Overlay Container */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 z-[100] transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[-10px_0_30px_rgba(0,0,0,0.15)] overflow-hidden ${isEmployee ? 'translate-x-full' : 'translate-x-0'}`}
        >
          {/* Inner Gradient Background (200% width, translates inversely) */}
          <div 
            className={`absolute top-0 left-[-100%] h-full w-[200%] bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isEmployee ? 'translate-x-0' : 'translate-x-1/2'} text-white`}
          >
            {/* Decorative background shapes inside overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPgo8L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>

            {/* Overlay Left Content (Shows when Admin is active, pushing user to Employee) */}
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isEmployee ? '-translate-x-[20%]' : 'translate-x-0'}`}>
              <div className="w-20 h-20 mb-6 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                <span className="text-4xl">💼</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">Employee Portal</h1>
              <p className="text-sm lg:text-base font-light mb-10 tracking-wide text-indigo-100 leading-relaxed max-w-[85%] mx-auto">
                Enter your personal workspace to manage tasks, attendance, leaves, and collaborate.
              </p>
              <button 
                onClick={() => setIsEmployee(true)}
                className="relative overflow-hidden group rounded-full border-2 border-white/80 px-12 py-3.5 font-bold uppercase tracking-wider text-sm transition-all hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10 group-hover:text-indigo-600 transition-colors duration-300">Switch to Employee</span>
                <div className="absolute inset-0 h-full w-full bg-white scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
              </button>
            </div>

            {/* Overlay Right Content (Shows when Employee is active, pushing user to Admin) */}
            <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isEmployee ? 'translate-x-0' : 'translate-x-[20%]'}`}>
              <div className="w-20 h-20 mb-6 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                <span className="text-4xl">👑</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">Admin Portal</h1>
              <p className="text-sm lg:text-base font-light mb-10 tracking-wide text-blue-100 leading-relaxed max-w-[85%] mx-auto">
                Oversee company operations, manage employees, and access global reporting.
              </p>
              <button 
                onClick={() => setIsEmployee(false)}
                className="relative overflow-hidden group rounded-full border-2 border-white/80 px-12 py-3.5 font-bold uppercase tracking-wider text-sm transition-all hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10 group-hover:text-blue-700 transition-colors duration-300">Switch to Admin</span>
                <div className="absolute inset-0 h-full w-full bg-white scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
              </button>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  )
}

function LoginForm({ type }: { type: 'admin' | 'employee' }) {
  const [identifier, setIdentifier] = useState(type === 'admin' ? "SA00001" : "")
  const [password, setPassword] = useState(type === 'admin' ? "password123" : "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false
    })

    if (res?.error) {
      setError("Invalid ID or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white flex flex-col items-center justify-center h-full px-16 text-center">
      
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 text-blue-600 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h1 className="text-4xl font-extrabold mb-2 text-slate-800 tracking-tight">
        {type === 'admin' ? 'Admin Login' : 'Employee Login'}
      </h1>
      <p className="text-slate-500 text-sm mb-10 font-medium">Enter your credentials to securely access your account</p>
      
      <div className="w-full relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder={type === 'admin' ? "Admin ID (e.g. SA00001)" : "Employee Email or ID"} 
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 px-4 py-3.5 pl-12 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" 
        />
      </div>

      <div className="w-full relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <input 
          type={showPassword ? "text" : "password"} 
          placeholder="Password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 px-4 py-3.5 pl-12 pr-12 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" 
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.781-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {error && (
        <div className="w-full bg-red-50 text-red-600 border border-red-100 rounded-lg p-3 text-sm font-medium mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      <div className="w-full flex justify-end mb-8">
        <a href="#" className="text-blue-600 text-sm hover:text-blue-700 hover:underline font-semibold transition-colors">Forgot your password?</a>
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 text-white px-8 py-4 font-bold uppercase tracking-wide text-sm hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:bg-slate-900 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
