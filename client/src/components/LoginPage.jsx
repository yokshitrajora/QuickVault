import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api, setToken } from '../api/client';

export function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Please provide your name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      let data;
      if (isRegister) {
        data = await api.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
      } else {
        data = await api.login({
          email: email.trim().toLowerCase(),
          password,
        });
      }

      setToken(data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsDemoLoading(true);
    try {
      const data = await api.demoLogin();
      setToken(data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand header */}
        <div className="login-header">
          <div className="login-logo-mark">Q</div>
          <h1 className="login-title">QuickVault</h1>
          <p className="login-subtitle">
            {isRegister
              ? 'Create an account to start organizing your digital hub'
              : 'Sign in to access your bookmarks, snippets, and notes'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`login-tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="login-error">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="login-field">
              <label className="login-label">Full Name</label>
              <div className="login-input-wrap">
                <User className="login-input-icon" />
                <input
                  type="text"
                  className="login-input"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="login-field">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrap">
              <Mail className="login-input-icon" />
              <input
                type="email"
                className="login-input"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <Lock className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder={isRegister ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading || isDemoLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>or explore instantly</span>
        </div>

        {/* 1-click Demo button */}
        <button
          type="button"
          className="login-demo-btn"
          onClick={handleDemoLogin}
          disabled={isLoading || isDemoLoading}
        >
          {isDemoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-neutral-400" />
          )}
          <span>Continue as Demo User</span>
        </button>

        {/* Footer info */}
        <div className="login-footer">
          <span>QuickVault &bull; Smart, Minimal &amp; Local</span>
        </div>
      </div>
    </div>
  );
}
