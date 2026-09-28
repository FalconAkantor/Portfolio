import { Pane } from '../components/ui/Pane';
import { IntegrationGraph } from '../components/systems/IntegrationGraph';
import { useI18n } from '../i18n/context';

export function Network() {
  const { t } = useI18n();
  return (
    <Pane id="network" title={t.network.title} lead={t.network.lead}>
      <IntegrationGraph />
    </Pane>
  );
}
