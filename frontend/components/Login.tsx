'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { useSound } from '@/contexts/SoundContext';
import { useLocaleFormat } from '@/lib/formatLocale';
import BanScreen from './BanScreen';
import { isBackendConfigured } from '@/lib/backendV1';

export default function Login() {
  const { t } = useTranslation('auth');
  const { locale } = useLocaleFormat();
  const monthNames = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, i, 1))
      ),
    [locale]
  );

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // Clear any existing messages on component mount
  useEffect(() => {
    setMessage('');
  }, []);
  const [banInfo, setBanInfo] = useState<any>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { login, createAccount } = useUser();
  const { playSuccess, playError } = useSound();

  const handleSignIn = async () => {
    if (!username || !password) {
      setMessage(t('enterUserPass'));
      return;
    }
    const result = await login(username, password);
    if (result.ban) {
      setBanInfo(result.ban);
      playError();
    } else {
      if (!result.success) {
        setMessage(result.message);
        playError();
      } else {
        playSuccess();
        setMessage('');
        setUsername('');
        setPassword('');
      }
      setBanInfo(null);
    }
  };

  // Note: We can't reliably filter emojis during typing for login/signup
  // because we don't know if they're admin until they submit.
  // Validation happens on submission in createAccount/login functions.
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSignUp = async () => {
    if (!username || !password) {
      setMessage(t('userPassRequired'));
      return;
    }
    if (password.length < 6) {
      setMessage(t('passwordMin'));
      return;
    }
    const result = await createAccount(
      username,
      password,
      gender,
      isBackendConfigured() ? email.trim() || undefined : undefined
    );
    if (!result.success) {
      setMessage(result.message);
      playError();
    } else {
      playSuccess();
      setMessage('');
    }
    setBanInfo(null);
    if (result.success) {
      // Auto sign in after successful sign up
      await handleSignIn();
    }
  };

  const handleAppealSubmitted = () => {
    setBanInfo(null);
    setUsername('');
    setPassword('');
  };

  if (banInfo) {
    return <BanScreen ban={banInfo} username={username} onAppealSubmitted={handleAppealSubmitted} />;
  }

  return (
    <>
      <div id="login-screen">
        <div className="login-box">
          {mode === 'signup' && (
            <button
              className="back-arrow-btn"
              onClick={() => {
                setMode('signin');
                setMessage('');
                setUsername('');
                setPassword('');
                setGender('');
                setBirthMonth('');
                setBirthDay('');
                setBirthYear('');
                setEmail('');
              }}
              aria-label={t('backAria')}
            >
              ←
            </button>
          )}

          <h1 className="pixel-place-title">
            <span>{t('titlePixel')}</span>
            <span>{t('titlePlace')}</span>
          </h1>

          {mode === 'signin' ? (
            <>
              <input
                id="user"
                placeholder={t('placeholderLoginId')}
                value={username}
                onChange={handleUsernameChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <input
                id="pass"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <div className="input-hint">{t('passwordHintSignin')}</div>
              <button 
                className="btn auth-btn signin-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSignIn();
                }}
                type="button"
              >
                {t('submitSignIn')}
              </button>
              <button 
                className="btn auth-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMode('signup');
                  setMessage('');
                  setUsername('');
                  setPassword('');
                  setGender('');
                  setBirthMonth('');
                  setBirthDay('');
                  setBirthYear('');
                  setEmail('');
                }}
                type="button"
                style={{
                  marginTop: '12px',
                  background: 'var(--accent)',
                  color: '#fff',
                  width: '100%'
                }}
              >
                {t('buttonCreate')}
              </button>
            </>
          ) : (
            <>
              <h2 className="signup-title">{t('signupHeadline')}</h2>

              <div className="birthday-section">
                <label>{t('birthdayLabel')}</label>
                <div className="birthday-inputs">
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">{t('month')}</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{monthNames[i]}</option>
                    ))}
                  </select>
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">{t('day')}</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">{t('year')}</option>
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>

              <input
                id="user"
                placeholder={t('signupUsernamePlaceholder')}
                value={username}
                onChange={handleUsernameChange}
              />
              <div className="input-hint">{t('usernameHintNotRealName')}</div>

              <input
                id="pass"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={handlePasswordChange}
              />
              <div className="input-hint">{t('passwordHintSignup')}</div>

              {isBackendConfigured() ? (
                <>
                  <input
                    id="email-signup"
                    type="email"
                    autoComplete="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="input-hint">{t('emailHintOptional')}</div>
                </>
              ) : null}

              <div className="gender-section">
                <label>{t('genderSignupLabel')}</label>
                <div className="gender-buttons">
                  <button
                    type="button"
                    className={`gender-btn gender-male ${gender === 'Male' ? 'selected' : ''}`}
                    onClick={() => {
                      if (gender === 'Male') {
                        setGender('');
                      } else {
                        setGender('Male');
                      }
                    }}
                  >
                    <svg className="gender-symbol" viewBox="0 0 100 100" width="40" height="40">
                      {/* Male bathroom symbol - exact match to image */}
                      <circle cx="50" cy="15" r="11" fill="currentColor" />
                      <rect x="38" y="26" width="24" height="24" fill="currentColor" />
                      <line x1="38" y1="36" x2="24" y2="36" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="24" cy="36" r="4" fill="currentColor" />
                      <line x1="62" y1="36" x2="76" y2="36" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="76" cy="36" r="4" fill="currentColor" />
                      <line x1="44" y1="50" x2="44" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="44" cy="78" r="5" fill="currentColor" />
                      <line x1="56" y1="50" x2="56" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="56" cy="78" r="5" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`gender-btn gender-female ${gender === 'Female' ? 'selected' : ''}`}
                    onClick={() => {
                      if (gender === 'Female') {
                        setGender('');
                      } else {
                        setGender('Female');
                      }
                    }}
                  >
                    <svg className="gender-symbol" viewBox="0 0 100 100" width="40" height="40">
                      {/* Female bathroom symbol - exact match to image */}
                      <circle cx="50" cy="15" r="11" fill="currentColor" />
                      <path d="M 36 26 L 50 52 L 64 26 Z" fill="currentColor" />
                      <line x1="36" y1="30" x2="24" y2="40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="24" cy="40" r="4" fill="currentColor" />
                      <line x1="64" y1="30" x2="76" y2="40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="76" cy="40" r="4" fill="currentColor" />
                      <line x1="46" y1="52" x2="46" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="46" cy="78" r="5" fill="currentColor" />
                      <line x1="54" y1="52" x2="54" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="54" cy="78" r="5" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`gender-btn gender-other ${gender === 'Other' ? 'selected' : ''}`}
                    onClick={() => {
                      if (gender === 'Other') {
                        setGender('');
                      } else {
                        setGender('Other');
                      }
                    }}
                  >
                    <svg className="gender-symbol" viewBox="0 0 100 100" width="40" height="40">
                      <defs>
                        <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ff0000" />
                          <stop offset="16.66%" stopColor="#ff7f00" />
                          <stop offset="33.33%" stopColor="#ffff00" />
                          <stop offset="50%" stopColor="#00ff00" />
                          <stop offset="66.66%" stopColor="#0000ff" />
                          <stop offset="83.33%" stopColor="#4b0082" />
                          <stop offset="100%" stopColor="#9400d3" />
                        </linearGradient>
                        <clipPath id="leftHalfOther">
                          <rect x="0" y="0" width="50" height="100" />
                        </clipPath>
                        <clipPath id="rightHalfOther">
                          <rect x="50" y="0" width="50" height="100" />
                        </clipPath>
                      </defs>
                      {/* Left half - Male symbol (clipped) */}
                      <g clipPath="url(#leftHalfOther)">
                        <circle cx="50" cy="15" r="11" fill="currentColor" />
                        <rect x="38" y="26" width="24" height="24" fill="currentColor" />
                        <line x1="38" y1="36" x2="24" y2="36" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="24" cy="36" r="4" fill="currentColor" />
                        <line x1="44" y1="50" x2="44" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="44" cy="78" r="5" fill="currentColor" />
                        <line x1="56" y1="50" x2="56" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="56" cy="78" r="5" fill="currentColor" />
                      </g>
                      {/* Right half - Female symbol (clipped) */}
                      <g clipPath="url(#rightHalfOther)">
                        <circle cx="50" cy="15" r="11" fill="currentColor" />
                        <path d="M 36 26 L 50 52 L 64 26 Z" fill="currentColor" />
                        <line x1="64" y1="30" x2="76" y2="40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="76" cy="40" r="4" fill="currentColor" />
                        <line x1="46" y1="52" x2="46" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="46" cy="78" r="5" fill="currentColor" />
                        <line x1="54" y1="52" x2="54" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="54" cy="78" r="5" fill="currentColor" />
                      </g>
                      {/* Vertical divider line */}
                      <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="terms-text">
                <Trans
                  i18nKey="termsAgreement"
                  ns="auth"
                  components={{
                    termsLink: (
                      <a
                        href="#"
                        className="terms-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTerms(true);
                        }}
                      />
                    ),
                    privacyLink: (
                      <a
                        href="#"
                        className="terms-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPrivacy(true);
                        }}
                      />
                    ),
                  }}
                />
              </div>

              <button 
                className="btn auth-btn signup-submit-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSignUp();
                }}
                type="button"
              >
                {t('submitSignUp')}
              </button>
            </>
          )}

          {message && <div id="msg" className="show">{message}</div>}
        </div>
      </div>

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('termsOfUseModalTitle')}</h2>
              <button className="modal-close" onClick={() => setShowTerms(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{t('termsP1')}</p>
              <p>{t('termsP2')}</p>
              <p>{t('termsP3')}</p>
              <p>{t('termsP4')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn auth-btn" onClick={() => setShowTerms(false)}>{t('modalClose')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('privacyModalTitle')}</h2>
              <button className="modal-close" onClick={() => setShowPrivacy(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{t('privacyP1')}</p>
              <p>{t('privacyP2')}</p>
              <p>{t('privacyP3')}</p>
              <p>{t('privacyP4')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn auth-btn" onClick={() => setShowPrivacy(false)}>{t('modalClose')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
