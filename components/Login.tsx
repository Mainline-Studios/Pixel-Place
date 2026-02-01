'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import BanScreen from './BanScreen';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [message, setMessage] = useState('');
  const [banInfo, setBanInfo] = useState<any>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { login, createAccount } = useUser();

  const handleSignIn = async () => {
    if (!username || !password) {
      setMessage('Enter both username and password.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    const result = await login(username, password);
    if (result.ban) {
      setBanInfo(result.ban);
    } else {
      setMessage(result.message);
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
      setMessage('Username and password are required.');
      return;
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }
    const result = await createAccount(username, password, gender);
    setMessage(result.message);
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
              }}
              aria-label="Back"
            >
              ←
            </button>
          )}

          <h1 className="pixel-place-title">
            <span>PIXEL</span>
            <span>PLACE</span>
          </h1>

          {mode === 'signin' ? (
            <>
              <input
                id="user"
                placeholder="Username/Email/Phone"
                value={username}
                onChange={handleUsernameChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <input
                id="pass"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <div className="input-hint">At least 6 characters</div>
              <button 
                className="btn auth-btn signin-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSignIn();
                }}
                type="button"
              >
                Sign In
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
                Create
              </button>
            </>
          ) : (
            <>
              <h2 className="signup-title">PIXEL PLACE IS A FUN PLACE TO BE!</h2>

              <div className="birthday-section">
                <label>Birthday</label>
                <div className="birthday-inputs">
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i]}</option>
                    ))}
                  </select>
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="birthday-select"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>

              <input
                id="user"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
              />
              <div className="input-hint">not you name!</div>

              <input
                id="pass"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              <div className="input-hint">At least 8 characters</div>

              <div className="gender-section">
                <label>Gender (Optional)</label>
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
                By clicking Sign Up, you are agreeing to the{' '}
                <a href="#" className="terms-link" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
                  Terms of Use
                </a>
                {' '}including the arbitration clause and you are acknowledging the{' '}
                <a href="#" className="terms-link" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>
                  Privacy Policy
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
                Sign Up
              </button>
            </>
          )}

          <div id="msg" className={message ? 'show' : ''}>{message}</div>
        </div>
      </div>

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Terms of Use</h2>
              <button className="modal-close" onClick={() => setShowTerms(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>We want everyone to have fun while staying safe. You can be any age to play, but it&apos;s important that you follow the rules and listen to your parents or guardians when using the game. Playing fairly and safely helps make the game enjoyable for everyone.</p>

              <p>When you create an account or play the game, you promise to be honest and not try to cheat, hack, or do anything that might ruin the experience for other players. You should never share your password with anyone, and if you notice something wrong or unsafe, you should tell a parent or guardian right away. It&apos;s important to be kind to other players, don&apos;t use mean or hurtful words, and respect everyone in the game.</p>

              <p>Any items, points, or rewards you earn in the game are only for use inside the game and don&apos;t have real-world money value. We may change, remove, or give new items at any time to keep the game fair and fun. Sometimes the game might not work perfectly, but we do our best to make it safe, fun, and reliable.</p>

              <p>By playing, you agree that we can make changes to the game or rules to improve the experience, and that you will follow the updated rules when we do. Your parents or guardians may need to help you understand or follow these rules, and we encourage them to supervise your play. The most important rule is to have fun while being safe, respectful, and fair to everyone in the game.</p>
            </div>
            <div className="modal-footer">
              <button className="btn auth-btn" onClick={() => setShowTerms(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Privacy Policy</h2>
              <button className="modal-close" onClick={() => setShowPrivacy(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>We care about your privacy and want to keep your information safe while you play our game. We may collect some information, like your username, game progress, or device information, to help the game work properly and make it more fun. We do not collect personal information like your full name, address, or payment details unless your parents or guardians provide it with permission.</p>

              <p>Any information we collect is used only to make the game better and to keep players safe. We may use it to save your progress, let you connect with friends, or send important updates about the game. We never sell or share your personal information with other companies for advertising or marketing purposes.</p>

              <p>We may share information with our service providers who help run the game, but only as needed to provide the game and keep it secure. Your parents or guardians can access, review, or request deletion of your information at any time by contacting us. We also take reasonable steps to protect your data from loss, theft, or misuse.</p>

              <p>By playing the game, you agree that we can collect and use information as described here. We may update this Privacy Policy from time to time, and when we do, we will make sure parents and players know about the changes. The goal is always to make the game safe, fun, and respectful for everyone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn auth-btn" onClick={() => setShowPrivacy(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
