import { Pane } from '../components/ui/Pane';
import { ContactChannels } from '../components/contact/ContactChannels';
import { Signature } from '../components/contact/Signature';
import { useI18n } from '../i18n/context';

export function Contact() {
  const { t } = useI18n();
  return (
    <Pane id="contact" title={t.contact.title} lead={t.contact.lead} meta="port 443 · open">
      <ContactChannels />
      <Signature />
    </Pane>
  );
}
