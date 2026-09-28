import { Pane } from '../components/ui/Pane';
import { BriefComposer } from '../components/contact/BriefComposer';
import { EmailCard } from '../components/contact/EmailCard';
import { contactChannels } from '../lib/contact';
import { useI18n } from '../i18n/context';

export function Contact() {
  const { t } = useI18n();
  // The e-mail has its own card; the list shows the other channels.
  const channels = contactChannels().filter((ch) => ch.id !== 'email');

  return (
    <Pane id="contact" title={t.contact.title} lead={t.contact.lead} meta="port 443 · open">
      <EmailCard />
      <h3 className="subhead contact__or">{t.contact.orBrief}</h3>
      <BriefComposer />
      {channels.length ? (
        <div className="channels">
          <h3 className="subhead">{t.contact.channels}</h3>
          <ul className="channels__list">
            {channels.map((ch) => (
              <li key={ch.id}>
                <a
                  className="channels__link"
                  href={ch.href}
                  {...(ch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="channels__label mono">{ch.label}</span>
                  <span className="channels__value">{ch.display}</span>
                  {ch.external ? <span className="sr-only"> ({t.a11y.externalLink})</span> : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Pane>
  );
}
