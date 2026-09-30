import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/context';
import './promo.css';

const base = import.meta.env.BASE_URL;
export const PROMO = {
  wide: `${base}video/automariza-16x9.mp4`,
  tall: `${base}video/automariza-9x16.mp4`,
  posterWide: `${base}video/automariza-16x9.jpg`,
  posterTall: `${base}video/automariza-9x16.jpg`,
  captions: `${base}video/automariza.es.vtt`,
};

/** Portrait phones get the 9:16 cut; everything else the 16:9 one. */
const prefersTall = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="promo-play">
      <circle cx="12" cy="12" r="11" />
      <path d="M10 8.2 L16.2 12 L10 15.8 Z" />
    </svg>
  );
}

/** Native <dialog> player: Esc and the backdrop close it, focus returns to the trigger. */
function useVideoDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [tall, setTall] = useState(false);

  const show = () => {
    setTall(prefersTall());
    setOpen(true);
  };

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return { dialog, open, tall, show, hide: () => setOpen(false) };
}

function VideoDialog({ state }: { state: ReturnType<typeof useVideoDialog> }) {
  const { t } = useI18n();
  const { dialog, open, tall, hide } = state;
  return (
    <dialog
      ref={dialog}
      className={`promo-dialog${tall ? ' promo-dialog--tall' : ''}`}
      aria-label={t.video.dialog}
      onClose={hide}
      onClick={(e) => {
        if (e.target === e.currentTarget) hide();
      }}
    >
      <div className="promo-dialog__frame">
        <button type="button" className="promo-dialog__close" onClick={hide} aria-label={t.video.close}>
          <span aria-hidden="true">×</span>
        </button>
        {open ? (
          <video
            className="promo-dialog__video"
            src={tall ? PROMO.tall : PROMO.wide}
            poster={tall ? PROMO.posterTall : PROMO.posterWide}
            controls
            autoPlay
            playsInline
            preload="auto"
          >
            <track kind="captions" src={PROMO.captions} srcLang="es" label="Español" />
          </video>
        ) : null}
      </div>
    </dialog>
  );
}

/** Compact trigger for a row of buttons (tech hero, simple hero). */
export function PromoVideoButton({ className = 'btn' }: { className?: string }) {
  const { t, lang } = useI18n();
  const state = useVideoDialog();
  return (
    <>
      <button type="button" className={`${className} promo-btn`} onClick={state.show} aria-haspopup="dialog">
        <PlayIcon />
        {t.video.watch}
        <span className="promo-btn__len">
          {t.video.length}
          {lang === 'es' ? '' : ` · ${t.video.spanish}`}
        </span>
      </button>
      <VideoDialog state={state} />
    </>
  );
}

/** Poster card with the headline frame of the video (simple version). */
export function PromoVideoCard() {
  const { t, lang } = useI18n();
  const state = useVideoDialog();
  return (
    <div className="promo-card">
      <button type="button" className="promo-card__poster" onClick={state.show} aria-haspopup="dialog">
        <img src={PROMO.posterWide} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
        <span className="promo-card__play">
          <PlayIcon />
          <span>
            {t.video.watch} · {t.video.length}
            {lang === 'es' ? '' : ` · ${t.video.spanish}`}
          </span>
        </span>
      </button>
      <div className="promo-card__copy">
        <p className="promo-card__kicker">{t.video.cardKicker}</p>
        <h2 className="promo-card__title">{t.video.cardTitle}</h2>
        <p className="promo-card__text">{t.video.cardText}</p>
        <p className="promo-card__made">{t.video.madeWith}</p>
      </div>
      <VideoDialog state={state} />
    </div>
  );
}
