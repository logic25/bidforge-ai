const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  type: 'welcome' | 'deadline_reminder' | 'discovery_digest' | 'purchase_notification' | 'team_invitation';
  to: string;
  data: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { type, to, data } = payload;

    let subject = '';
    let html = '';

    switch (type) {
      case 'welcome':
        subject = 'Welcome to BidForge! 🔨';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">Welcome to BidForge!</h1>
            <p>Hi ${data.name || 'there'},</p>
            <p>You're all set to start discovering and winning RFPs with AI-powered tools.</p>
            <h3>Getting Started:</h3>
            <ol>
              <li><strong>Complete onboarding</strong> to set your industry and target states</li>
              <li><strong>Add your first RFP</strong> to the pipeline</li>
              <li><strong>Set up Discovery</strong> to find matching opportunities automatically</li>
            </ol>
            <p>
              <a href="${data.appUrl || 'https://bidforge.app'}/dashboard" 
                 style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                Go to Dashboard
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">— The BidForge Team</p>
          </div>
        `;
        break;

      case 'deadline_reminder':
        subject = `⏰ Deadline in ${data.daysUntil} day${data.daysUntil === 1 ? '' : 's'}: ${data.rfpTitle}`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Deadline Reminder</h2>
            <p><strong>${data.rfpTitle}</strong> is due in <strong>${data.daysUntil} day${data.daysUntil === 1 ? '' : 's'}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Agency:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.agency || 'N/A'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Deadline:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.deadline}</td></tr>
              <tr><td style="padding: 8px;"><strong>Stage:</strong></td><td style="padding: 8px;">${data.stage}</td></tr>
            </table>
            <p>
              <a href="${data.appUrl || 'https://bidforge.app'}/pipeline"
                 style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                View in Pipeline
              </a>
            </p>
          </div>
        `;
        break;

      case 'discovery_digest':
        const rfpList = (data.rfps || []).map((r: any) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${r.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${r.agency || 'Unknown'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${r.relevanceScore || '—'}%</td>
          </tr>
        `).join('');
        subject = `📋 ${data.count} new RFP${data.count === 1 ? '' : 's'} matching your criteria`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Daily Discovery Digest</h2>
            <p>We found <strong>${data.count}</strong> new RFP${data.count === 1 ? '' : 's'} matching your criteria today.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left;">Title</th><th style="padding: 8px; text-align: left;">Agency</th><th style="padding: 8px; text-align: left;">Score</th></tr>
              ${rfpList}
            </table>
            <p>
              <a href="${data.appUrl || 'https://bidforge.app'}/discovery"
                 style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                View All Discoveries
              </a>
            </p>
          </div>
        `;
        break;

      case 'purchase_notification':
        subject = `💰 Someone purchased your template: ${data.templateTitle}`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Template Sold! 🎉</h2>
            <p>Your template <strong>"${data.templateTitle}"</strong> was just purchased for <strong>$${data.price}</strong>.</p>
            <p>Your revenue share (70%): <strong>$${(data.price * 0.7).toFixed(2)}</strong></p>
            <p>
              <a href="${data.appUrl || 'https://bidforge.app'}/templates"
                 style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                View Sales Dashboard
              </a>
            </p>
          </div>
        `;
        break;

      case 'team_invitation':
        subject = `You're invited to join ${data.companyName} on BidForge`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Team Invitation</h2>
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.companyName}</strong> on BidForge.</p>
            <p>
              <a href="${data.appUrl || 'https://bidforge.app'}/auth"
                 style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                Accept Invitation
              </a>
            </p>
          </div>
        `;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Unknown email type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Send via Resend if API key is available, otherwise log
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BidForge <noreply@bidforge.app>',
          to: [to],
          subject,
          html,
        }),
      });
      const result = await res.json();
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: log the email
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    return new Response(JSON.stringify({ success: true, mock: true, subject }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
