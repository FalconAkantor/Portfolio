import { useId, useRef, useState, type FormEvent } from 'react';
import { site } from '../../config/site';
import { useI18n } from '../../i18n/context';
import { formatBrief, mailtoHref, type Brief, type BriefType } from '../../lib/brief';
import './contact.css';

type CopyState = 'idle' | 'copied' | 'failed';

/**
 * Turns "tell me what you want to automate" into a structured request.
 * No backend: the request is sent through the visitor's own mail client, or copied.
 */
export function BriefComposer() {
  const { t } = useI18n();
  const c = t.contact;
  const id = useId();
  const [brief, setBrief] = useState<Brief>({ types: [], process: '', company: '', name: '' });
  const [error, setError] = useState(false);
  const [copy, setCopy] = useState<CopyState>('idle');
  const processRef = useRef<HTMLTextAreaElement>(null);
  const email = site.contact.email.trim();

  const update = <K extends keyof Brief>(key: K, value: Brief[K]) => {
    setBrief((b) => ({ ...b, [key]: value }));
    setCopy('idle');
    if (key === 'process' && String(value).trim()) setError(false);
  };

  const toggleType = (type: BriefType) =>
    update('types', brief.types.includes(type) ? brief.types.filter((x) => x !== type) : [...brief.types, type]);

  const validate = () => {
    if (brief.process.trim()) return true;
    setError(true);
    processRef.current?.focus();
    return false;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    if (email) window.location.assign(mailtoHref(email, brief, c));
    else void copyBrief();
  };

  const copyBrief = async () => {
    if (!validate()) return;
    try {
      await navigator.clipboard.writeText(formatBrief(brief, c));
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
  };

  const preview = formatBrief(brief, c);

  return (
    <form className="brief" onSubmit={onSubmit} noValidate>
      <div className="brief__fields">
        <fieldset className="brief__types">
          <legend className="brief__label">{c.typeLegend}</legend>
          <div className="brief__type-list">
            {(Object.keys(c.types) as BriefType[]).map((type) => (
              <label key={type} className={`brief__type mono${brief.types.includes(type) ? ' is-on' : ''}`}>
                <input type="checkbox" checked={brief.types.includes(type)} onChange={() => toggleType(type)} />
                <span>{c.types[type]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="brief__field">
          <label className="brief__label" htmlFor={`${id}-process`}>
            {c.describe}
          </label>
          <p id={`${id}-hint`} className="brief__hint">
            {c.describeHint}
          </p>
          <textarea
            ref={processRef}
            id={`${id}-process`}
            rows={5}
            value={brief.process}
            placeholder={c.describePlaceholder}
            onChange={(e) => update('process', e.target.value)}
            aria-invalid={error}
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
            required
          />
          {error ? (
            <p id={`${id}-error`} className="brief__error mono" role="alert">
              {c.required}
            </p>
          ) : null}
        </div>

        <div className="brief__row">
          <div className="brief__field">
            <label className="brief__label" htmlFor={`${id}-company`}>
              {c.company} <span className="brief__opt">({c.optional})</span>
            </label>
            <input id={`${id}-company`} value={brief.company} onChange={(e) => update('company', e.target.value)} autoComplete="organization" />
          </div>
          <div className="brief__field">
            <label className="brief__label" htmlFor={`${id}-name`}>
              {c.name} <span className="brief__opt">({c.optional})</span>
            </label>
            <input id={`${id}-name`} value={brief.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" />
          </div>
        </div>
      </div>

      <div className="brief__preview panel panel--ticks">
        <div className="panel__head">
          <span className="panel__title">{c.preview}</span>
          <span>request.txt</span>
        </div>
        <pre className="brief__ticket mono" aria-live="off">
          {preview}
        </pre>
        <div className="brief__actions">
          {email ? (
            <button type="submit" className="btn btn--primary">
              {c.sendEmail}
            </button>
          ) : null}
          <button type={email ? 'button' : 'submit'} className={`btn${email ? '' : ' btn--primary'}`} onClick={email ? () => void copyBrief() : undefined}>
            {c.copy}
          </button>
        </div>
        <p className="brief__status mono" role="status">
          {copy === 'copied' ? c.copied : copy === 'failed' ? c.copyFailed : email ? '' : c.noEmail}
        </p>
      </div>
    </form>
  );
}
