import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | valid | invalid | expired
  const [userRecord, setUserRecord] = useState(null);

  const token = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }

    async function validateToken() {
      const records = await base44.entities.User.filter({ invitation_token: token });
      if (records.length === 0) { setStatus('invalid'); return; }
      const record = records[0];
      if (new Date(record.invitation_expires_at) < new Date()) { setStatus('expired'); return; }
      setUserRecord(record);
      setStatus('valid');
    }

    validateToken();
  }, [token]);

  async function handleAccept() {
    if (!userRecord) return;
    setStatus('loading');
    // Mark user as active
    await base44.entities.User.update(userRecord.id, {
      status: 'active',
      invitation_token: null,
      invitation_expires_at: null,
    });
    // Redirect to login so Base44 auth flow can link them
    base44.auth.redirectToLogin('/onboarding');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-lg">Parlios</span>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Validation de votre invitation…</p>
          </div>
        )}

        {status === 'valid' && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Invitation valide</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Vous avez été invité(e) à rejoindre Parlios Prospect Pilot AI.
                Cliquez ci-dessous pour vous connecter et configurer votre espace.
              </p>
            </div>
            <Button size="lg" className="w-full" onClick={handleAccept}>
              Accepter l'invitation et se connecter
            </Button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Invitation invalide</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Ce lien d'invitation n'existe pas ou a déjà été utilisé.
              </p>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Invitation expirée</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Ce lien d'invitation a expiré (valable 7 jours). Demandez un nouvel envoi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}