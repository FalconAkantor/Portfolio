import { useState } from 'react';
import { site } from '../../config/site';
import { useI18n } from '../../i18n/context';
import { formatPhone, whatsappHref } from '../../lib/contact';
import { StatusDot } from '../ui/StatusDot';
import { Wordmark } from '../ui/Wordmark';
import './contact.css';

/** Two direct lines and nothing else: e-mail and WhatsApp (messages only). */
export function ContactChannels() {
  const { t } = useI18n();
  const c = t.contact;
  const email = site.contact.email.trim();
  const whatsapp = site.contact.whatsapp.replace(/\D/g, '');
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const mailto = `mailto:${email}?subject=${encodeURIComponent(c.subject)}`;
  const wa = whatsappHref(whatsapp, c.whatsappGreeting);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
  };

  const [user, domain] = email.split('@');

  return (
    <div className="reach panel panel--ticks">
      <div className="reach__hook">
        <p className="reach__kicker mono">
          <Wordmark /> · {c.hookKicker}
        </p>
        <h3 className="reach__title">{c.hookTitle}</h3>
        <p className="reach__sub">{c.hookSub}</p>
      </div>

      <div className="reach__channels">
        {email ? (
          <section className="reach__ch" aria-labelledby="reach-mail">
            <p id="reach-mail" className="reach__label mono">
              <span aria-hidden="true">✉</span> {c.emailLabel}
            </p>
            <a className="reach__value" href={mailto}>
              <span>{user}</span>
              <span className="reach__at">@</span>
              <span className="reach__dim">{domain}</span>
            </a>
            <p className="reach__hint">{c.emailHint}</p>
            <div className="reach__actions">
              <a className="btn btn--primary" href={mailto}>
                {c.writeEmail}
              </a>
              <button type="button" className="btn" onClick={() => void copy()}>
                {copied === 'ok' ? c.copiedEmail : c.copyEmail}
              </button>
              <span className="sr-only" role="status">
                {copied === 'ok' ? c.copiedEmail : copied === 'fail' ? c.copyFailed : ''}
              </span>
            </div>
          </section>
        ) : null}

        {whatsapp ? (
          <section className="reach__ch reach__ch--wa" aria-labelledby="reach-wa">
            <p id="reach-wa" className="reach__label mono">
              <span aria-hidden="true">◉</span> {c.whatsappLabel}
            </p>
            <a className="reach__value" href={wa} target="_blank" rel="noopener noreferrer">
              {formatPhone(whatsapp)}
              <span className="sr-only"> ({t.a11y.externalLink})</span>
            </a>
            <p className="reach__hint reach__hint--wa">
              <StatusDot status="ok" pulse />
              {c.whatsappHint}
            </p>
            <div className="reach__actions">
              <a className="btn btn--wa" href={wa} target="_blank" rel="noopener noreferrer">
                {c.openWhatsapp}
                <span className="sr-only"> ({t.a11y.externalLink})</span>
              </a>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
