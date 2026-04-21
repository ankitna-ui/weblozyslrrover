import { useState, useCallback, useEffect } from 'react';
import { validLicenceKeys } from '@/data/rovers';

const STORAGE_KEY = 'tslr_licence_key';
const SESSION_VALID_KEY = 'tslr_session_valid';

export function useLicence() {
  const [licenceKey, setLicenceKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });
  const [isValidated, setIsValidated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_VALID_KEY) === 'true' && !!localStorage.getItem(STORAGE_KEY);
  });
  const [error, setError] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const validate = useCallback((key: string): boolean => {
    if (isLocked) return false;
    
    const normalized = key.trim().toUpperCase();
    if (!normalized) {
      setError('Please enter a licence key');
      return false;
    }

    if (validLicenceKeys.has(normalized)) {
      setLicenceKey(normalized);
      setIsValidated(true);
      setError('');
      localStorage.setItem(STORAGE_KEY, normalized);
      sessionStorage.setItem(SESSION_VALID_KEY, 'true');
      return true;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setError('Invalid licence key');

    if (newAttempts >= 3) {
      setIsLocked(true);
      setError('Access Denied. Contact system administrator.');
    }
    return false;
  }, [attempts, isLocked]);

  const logout = useCallback(() => {
    setLicenceKey('');
    setIsValidated(false);
    setError('');
    setAttempts(0);
    setIsLocked(false);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_VALID_KEY);
  }, []);

  // Check URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('licence');
    if (urlKey && !isValidated) {
      validate(urlKey);
    }
  }, [validate, isValidated]);

  return { licenceKey, isValidated, error, isLocked, validate, logout, attempts };
}
