'use client';

import { useState, useEffect, useId } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useSound } from '@/contexts/SoundContext';
import BanScreen from './BanScreen';
import SiteSocialLinks from './SiteSocialLinks';
import BrandKitDownloadLink from './BrandKitDownloadLink';
import SiteLicenseAttribution from './SiteLicenseAttribution';
import StatusPageLink from './StatusPageLink';
import { isSupportedLocale } from '@/lib/locale';
import { useSiteLanguage } from '@/contexts/SiteLanguageContext';
import { getLoginUiStrings } from '@/lib/i18n/loginUi.index';
import {
  DEFAULT_EXTENDED_GENDER,
  GENDER_FEMALE,
  GENDER_IDENTITY_OPTIONS,
  GENDER_MALE,
  coerceExtendedGenderForSelect,
  isExtendedGenderBranch,
} from '@/lib/genderIdentityOptions';
import { getPasswordStrength } from '@/lib/passwordStrength';

export default function Login() {
  const { locale, setLocale, localeChoices } = useSiteLanguage();
  const genderSvgId = useId().replace(/[^a-zA-Z0-9_-]/g, '_');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [message, setMessage] = useState('');
  
  // Clear any existing messages on component mount
  useEffect(() => {
    setMessage('');
  }, []);
  const [banInfo, setBanInfo] = useState<{ ban: any; deviceBanned?: boolean } | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { login, createAccount } = useUser();
  const { playSuccess, playError } = useSound();
  const text = getLoginUiStrings(locale);
  const monthNames = text.monthNames;
  const signupPasswordStrength = mode === 'signup' ? getPasswordStrength(password) : null;

  const handleSignIn = async () => {
    if (!username || !password) {
      setMessage(text.enterUserPass);
      return;
    }
    const result = await login(username, password);
    if (result.ban) {
      setBanInfo({ ban: result.ban, deviceBanned: 'deviceBanned' in result ? !!result.deviceBanned : false });
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
      setMessage(text.userPassRequired);
      return;
    }
    if (password.length < 6) {
      setMessage(text.passLength);
      return;
    }
    const result = await createAccount(username, password, gender);
    if (result.ban) {
      setBanInfo({ ban: result.ban, deviceBanned: 'deviceBanned' in result ? !!result.deviceBanned : false });
      playError();
    } else if (!result.success) {
      setMessage(result.message);
      playError();
      setBanInfo(null);
    } else {
      playSuccess();
      setMessage('');
      setBanInfo(null);
    }
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
    const displayName = banInfo.deviceBanned ? text.deviceBannedDisplay : username;
    const ban = banInfo.ban && typeof banInfo.ban === 'object'
      ? {
          ...banInfo.ban,
          bannedBy: banInfo.ban.bannedBy ?? banInfo.ban.banned_by ?? 'Administrator',
          timestamp: banInfo.ban.timestamp ?? banInfo.ban.banned_at ?? Date.now(),
        }
      : banInfo.ban;
    return <BanScreen ban={ban} username={displayName} onAppealSubmitted={handleAppealSubmitted} />;
  }

  return (
    <>
      <div id="login-screen">
        <div className="login-screen-center">
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
              }}
              aria-label={text.backAria}
            >
              ←
            </button>
          )}

          <h1 className="pixel-place-title">
            <span>PIXEL</span>
            <span>PLACE</span>
          </h1>
          <div style={{ marginBottom: 10 }}>
            <select
              aria-label={text.languageAria}
              value={locale}
              onChange={(e) => {
                const v = e.target.value;
                if (!isSupportedLocale(v)) return;
                setLocale(v);
              }}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
            >
              {localeChoices.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {mode === 'signin' ? (
            <>
              <input
                id="user"
                placeholder={text.usernameEmailPhone}
                value={username}
                onChange={handleUsernameChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <input
                id="pass"
                type="password"
                placeholder={text.password}
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <div className="input-hint">{text.atLeast6}</div>
              <button 
                className="btn auth-btn signin-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSignIn();
                }}
                type="button"
              >
                {text.signIn}
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
                }}
                type="button"
                style={{
                  marginTop: '12px',
                  background: 'var(--accent)',
                  color: '#fff',
                  width: '100%'
                }}
              >
                {text.create}
              </button>
              <StatusPageLink variant="login" />
            </>
          ) : (
            <>
              <h2 className="signup-title">{text.signupTitle}</h2>

              <div className="birthday-section">
                <label>{text.birthday}</label>
                <div className="birthday-inputs">
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">{text.month}</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{monthNames[i]}</option>
                    ))}
                  </select>
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">{text.day}</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">{text.year}</option>
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>

              <input
                id="user"
                placeholder={text.username}
                value={username}
                onChange={handleUsernameChange}
              />
              <div className="input-hint">{text.notYourName}</div>

              <input
                id="pass"
                type="password"
                placeholder={text.password}
                value={password}
                onChange={handlePasswordChange}
              />
              <div className="input-hint">{text.atLeast8}</div>
              {signupPasswordStrength && (
                <div style={{ marginBottom: 12 }} aria-live="polite">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Password strength</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          signupPasswordStrength.tier >= 3
                            ? '#2ecc71'
                            : signupPasswordStrength.tier >= 2
                              ? '#f1c40f'
                              : '#e74c3c',
                      }}
                    >
                      {signupPasswordStrength.label}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(0,0,0,0.2)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${signupPasswordStrength.fraction * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #e74c3c, #f1c40f, #2ecc71)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="gender-section">
                <label>{text.genderOptional}</label>
                <div className="gender-buttons">
                  <button
                    type="button"
                    className={`gender-btn gender-male ${gender === GENDER_MALE ? 'selected' : ''}`}
                    onClick={() => {
                      if (gender === GENDER_MALE) {
                        setGender('');
                      } else {
                        setGender(GENDER_MALE);
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
                    className={`gender-btn gender-female ${gender === GENDER_FEMALE ? 'selected' : ''}`}
                    onClick={() => {
                      if (gender === GENDER_FEMALE) {
                        setGender('');
                      } else {
                        setGender(GENDER_FEMALE);
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
                    className={`gender-btn gender-other ${isExtendedGenderBranch(gender) ? 'selected' : ''}`}
                    onClick={() => {
                      if (isExtendedGenderBranch(gender)) {
                        setGender('');
                      } else {
                        setGender(DEFAULT_EXTENDED_GENDER);
                      }
                    }}
                    aria-expanded={isExtendedGenderBranch(gender)}
                    aria-haspopup="listbox"
                  >
                    <svg className="gender-symbol" viewBox="0 0 100 100" width="40" height="40" aria-hidden>
                      <defs>
                        <linearGradient
                          id={`${genderSvgId}-rainbow`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#ff0000" />
                          <stop offset="16.66%" stopColor="#ff7f00" />
                          <stop offset="33.33%" stopColor="#ffff00" />
                          <stop offset="50%" stopColor="#00ff00" />
                          <stop offset="66.66%" stopColor="#0000ff" />
                          <stop offset="83.33%" stopColor="#4b0082" />
                          <stop offset="100%" stopColor="#9400d3" />
                        </linearGradient>
                        <clipPath id={`${genderSvgId}-left`}>
                          <rect x="0" y="0" width="50" height="100" />
                        </clipPath>
                        <clipPath id={`${genderSvgId}-right`}>
                          <rect x="50" y="0" width="50" height="100" />
                        </clipPath>
                      </defs>
                      {/* Left half - Male symbol (clipped) */}
                      <g clipPath={`url(#${genderSvgId}-left)`}>
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
                      <g clipPath={`url(#${genderSvgId}-right)`}>
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
                {isExtendedGenderBranch(gender) && (
                  <div className="gender-identity-select-wrap">
                    <label htmlFor="gender-identity-select" className="gender-identity-select-label">
                      {text.identityOptional}
                    </label>
                    <select
                      id="gender-identity-select"
                      className="birthday-select gender-identity-select"
                      value={coerceExtendedGenderForSelect(gender)}
                      onChange={(e) => setGender(e.target.value)}
                      aria-label={text.genderIdentityAria}
                    >
                      {GENDER_IDENTITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="terms-text">
                {text.termsPrefix}
                <a href="#" className="terms-link" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
                  {text.termsOfUse}
                </a>
                {text.termsMiddle}
                <a href="#" className="terms-link" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>
                  {text.privacyPolicy}
                </a>
                .
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
                {text.signUp}
              </button>
              <StatusPageLink variant="login" />
            </>
          )}

          {message && <div id="msg" className="show">{message}</div>}
        </div>
        </div>

        <footer className="login-site-footer" role="contentinfo">
          <div className="login-site-footer__social">
            <SiteSocialLinks variant="urls" />
          </div>
          <div className="login-site-footer__brand-kit">
            <BrandKitDownloadLink variant="login" />
          </div>
          <div className="login-site-footer__legal">
            <SiteLicenseAttribution />
          </div>
        </footer>
      </div>

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{text.termsTitle}</h2>
              <button className="modal-close" onClick={() => setShowTerms(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{text.termsP1}</p>
              <p>{text.termsP2}</p>
              <p>{text.termsP3}</p>
              <p>{text.termsP4}</p>
            </div>
            <div className="modal-footer">
              <button className="btn auth-btn" onClick={() => setShowTerms(false)}>{text.termsClose}</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{text.privacyTitle}</h2>
              <button className="modal-close" onClick={() => setShowPrivacy(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{text.privacyP1}</p>
              <p>{text.privacyP2}</p>
              <p>{text.privacyP3}</p>
              <p>{text.privacyP4}</p>
            </div>
            <div className="modal-footer">
              <button className="btn auth-btn" onClick={() => setShowPrivacy(false)}>{text.privacyClose}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
