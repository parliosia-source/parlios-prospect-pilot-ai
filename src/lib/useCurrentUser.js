import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let cachedUser = null;
let cachedUserRecord = null;
let cachedOrg = null;

export function useCurrentUser() {
  const [authUser, setAuthUser] = useState(null);
  const [userRecord, setUserRecord] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cachedUser && cachedUserRecord) {
        setAuthUser(cachedUser);
        setUserRecord(cachedUserRecord);
        setOrganization(cachedOrg);
        setLoading(false);
        return;
      }

      const user = await base44.auth.me();
      if (cancelled) return;

      if (!user) {
        setLoading(false);
        return;
      }

      setAuthUser(user);
      cachedUser = user;

      // Load user record from entity
      const userRecords = await base44.entities.User.filter({ email: user.email });
      if (cancelled) return;

      const record = userRecords[0] || null;
      setUserRecord(record);
      cachedUserRecord = record;

      // Load organization if user has one
      if (record?.organization_id) {
        const orgs = await base44.entities.Organization.filter({ id: record.organization_id });
        if (!cancelled) {
          const org = orgs[0] || null;
          setOrganization(org);
          cachedOrg = org;
        }
      }

      if (!cancelled) setLoading(false);
    }

    load().catch(err => {
      if (!cancelled) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  function invalidateCache() {
    cachedUser = null;
    cachedUserRecord = null;
    cachedOrg = null;
  }

  return { authUser, userRecord, organization, loading, error, invalidateCache };
}