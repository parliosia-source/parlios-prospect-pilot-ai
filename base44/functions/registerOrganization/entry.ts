import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'super_admin') {
    return Response.json({ error: 'Forbidden: super_admin required' }, { status: 403 });
  }

  const { org_data, admin_email } = await req.json();

  if (!org_data?.name || !admin_email) {
    return Response.json({ error: 'Missing required fields: org_data.name, admin_email' }, { status: 400 });
  }

  // Check email not already linked to an org
  const existingUsers = await base44.asServiceRole.entities.User.filter({ email: admin_email });
  const alreadyLinked = existingUsers.find(u => u.organization_id);
  if (alreadyLinked) {
    return Response.json({ error: 'Cet email est déjà associé à une organisation.' }, { status: 409 });
  }

  // Generate unique slug
  let baseSlug = slugify(org_data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const existing = await base44.asServiceRole.entities.Organization.filter({ slug });
    if (existing.length === 0) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  // Create Organization
  const organization = await base44.asServiceRole.entities.Organization.create({
    name: org_data.name,
    slug,
    website: org_data.website || '',
    industry: org_data.industry || '',
    country: org_data.country || '',
    city: org_data.city || '',
    subscription_plan: org_data.subscription_plan || 'free',
    status: 'trial',
  });

  // Generate invitation token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Create pending org_admin user record
  const invitedUser = await base44.asServiceRole.entities.User.create({
    email: admin_email,
    organization_id: organization.id,
    role: 'org_admin',
    status: 'pending_invitation',
    invitation_token: token,
    invitation_expires_at: expiresAt,
  });

  // Send invitation email
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: admin_email,
    subject: `Invitation à rejoindre ${org_data.name} sur Parlios Prospect Pilot`,
    body: `Bonjour,\n\nVous avez été invité(e) à rejoindre l'organisation "${org_data.name}" sur Parlios Prospect Pilot AI en tant qu'administrateur.\n\nCliquez ici pour accepter votre invitation (valable 7 jours) :\n${Deno.env.get('APP_URL') || 'https://app.parlios.com'}/accept-invite?token=${token}\n\nÀ bientôt sur Parlios !`,
  });

  return Response.json({
    organization_id: organization.id,
    slug,
    admin_user_id: invitedUser.id,
    invitation_token: token,
  });
});