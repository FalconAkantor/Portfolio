import { useState } from 'react';
import { site } from '../../config/site';
import { useI18n } from '../../i18n/context';
import { Wordmark } from '../ui/Wordmark';
import './contact.css';

/** The direct line: big address, one tap to write, one tap to copy. */
export function EmailCard() {
  const { t } = useI18n();
  const c = t.contact;
  const email = site.contact.email.trim();
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  if (!email) return null;

  const [user, domain] = email.split('@');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
  };

  return (
    <div className="mailcard panel panel--ticks">
      <div className="mailcard__hook">
        <p className="mailcard__eyebrow mono">
          <Wordmark /> · {c.hookKicker}
        </p>
        <h3 className="mailcard__title">{c.hookTitle}</h3>
        <p className="mailcard__sub">{c.hookSub}</p>
      </div>
      <div className="mailcard__direct">
        <a className="mailcard__address" href={`mailto:${email}?subject=${encodeURIComponent(c.subject)}`}>
          <span className="mailcard__user">{user}</span>
          <span className="mailcard__at">@</span>
          <span className="mailcard__domain">{domain}</span>
        </a>
        <div className="mailcard__actions">
          <a className="btn btn--primary" href={`mailto:${email}?subject=${encodeURIComponent(c.subject)}`}>
            {c.writeEmail}
          </a>
          <button type="button" className="btn" onClick={() => void copy()}>
            {copied === 'ok' ? c.copiedEmail : c.copyEmail}
          </button>
          <span className="sr-only" role="status">
            {copied === 'ok' ? c.copiedEmail : copied === 'fail' ? c.copyFailed : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
