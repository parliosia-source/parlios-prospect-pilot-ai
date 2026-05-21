import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'org_admin') {
    return Response.json({ error: 'Forbidden: org_admin required' }, { status: 403 });
  }

  const { email, role } = await req.json();

  if (!email || !role) {
    return Response.json({ error: 'Missing required fields: email, role' }, { status: 400 });
  }

  if (!['manager', 'sales_user'].includes(role)) {
    return Response.json({ error: 'Invalid role. Must be manager or sales_user.' }, { status: 400 });
  }

  // Get the caller's organization_id from their user record
  const callerRecords = await base44.asServiceRole.entities.User.filter({ email: user.email });
  const callerRecord = callerRecords.find(u => u.organization_id);
  if (!callerRecord?.organization_id) {
    return Response.json({ error: 'Caller has no associated organization.' }, { status: 400 });
  }

  const organization_id = callerRecord.organization_id;

  // Check email not already linked to any organization
  const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
  const alreadyLinked = existingUsers.find(u => u.organization_id);
  if (alreadyLinked) {
    return Response.json({ error: 'Cet email est déjà associé à une organisation.' }, { status: 409 });
  }

  // Get organization name for the email
  const orgRecords = await base44.asServiceRole.entities.Organization.filter({ id: organization_id });
  const orgName = orgRecords[0]?.name || 'votre organisation';

  // Generate invitation token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Create pending user
  const invitedUser = await base44.asServiceRole.entities.User.create({
    email,
    organization_id,
    role,
    status: 'pending_invitation',
    invitation_token: token,
    invitation_expires_at: expiresAt,
  });

  // Send invitation email
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: email,
    subject: `Invitation à rejoindre ${orgName} sur Parlios Prospect Pilot`,
    body: `Bonjour,\n\nVous avez été invité(e) à rejoindre l'organisation "${orgName}" sur Parlios Prospect Pilot AI en tant que ${role === 'manager' ? 'Manager' : 'Sales User'}.\n\nToken d'invitation (valable 7 jours) : ${token}\n\nPartagez ce lien avec le membre invité pour accéder à la plateforme.\n\nÀ bientôt sur Parlios !`,
  });

  return Response.json({
    user_id: invitedUser.id,
    email,
    role,
    invitation_token: token,
  });
});