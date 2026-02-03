import { useState } from 'react'
import { supabase } from '../supabase'
import './Auth.css'

export default function Auth({ onGuestLogin }) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState(null)

    const handleGuestLogin = () => {
        if (onGuestLogin) {
            onGuestLogin({
                user: {
                    id: 'guest-user-123',
                    email: 'guest@eleven.ai',
                    user_metadata: { full_name: 'Guest User' }
                }
            })
        }
    }

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: displayName
                        }
                    }
                })
                if (error) throw error
                // Check if sign up requires email confirmation - often it does
                // But if we want to auto-login, we might need to handle session
                alert('Check your email for the confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-pause">
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                    <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p>{isSignUp ? 'Join Eleven for personalized health insights' : 'Sign in to access your consultations'}</p>
                </div>

                <form onSubmit={handleAuth} className="auth-form">
                    {isSignUp && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required={isSignUp}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="auth-footer">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                        >
                            Continue as Guest (Demo)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
