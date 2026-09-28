import { Pane } from '../components/ui/Pane';
import { ContactChannels } from '../components/contact/ContactChannels';
import { useI18n } from '../i18n/context';

export function Contact() {
  const { t } = useI18n();
  return (
    <Pane id="contact" title={t.contact.title} lead={t.contact.lead} meta="port 443 · open">
      <ContactChannels />
    </Pane>
  );
}
