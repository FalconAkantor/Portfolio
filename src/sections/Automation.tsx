import { useState } from 'react';
import { Pane } from '../components/ui/Pane';
import { automationChannels, automationFlows, type AutomationChannel } from '../data/automation';
import { useI18n } from '../i18n/context';
import './automation.css';

type Filter = AutomationChannel | 'all';

export function Automation() {
  const { t, l } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const rows = filter === 'all' ? automationFlows : automationFlows.filter((f) => f.channel === filter);
  const cols = t.automation.columns;

  return (
    <Pane id="automation" title={t.automation.title} lead={t.automation.lead} meta={`flows · ${String(automationFlows.length).padStart(2, '0')}`}>
      <div className="autofilter mono" role="group" aria-label={t.automation.filterLabel}>
        {(['all', ...automationChannels.map((c) => c.id)] as Filter[]).map((id) => {
          const label = id === 'all' ? t.automation.all : l(automationChannels.find((c) => c.id === id)!.label);
          return (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
              {label}
            </button>
          );
        })}
      </div>

      <div className="autotable panel">
        <table>
          <thead className="mono">
            <tr>
              <th scope="col">{cols.process}</th>
              <th scope="col">{cols.trigger}</th>
              <th scope="col">{cols.engine}</th>
              <th scope="col">{cols.result}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((flow) => (
              <tr key={flow.id}>
                <th scope="row">
                  <span className="autotable__channel mono">{flow.channel}</span>
                  {l(flow.name)}
                </th>
                <td data-label={cols.trigger}>{l(flow.trigger)}</td>
                <td data-label={cols.engine} className="autotable__engine">
                  {l(flow.engine)}
                </td>
                <td data-label={cols.result} className="autotable__result">
                  {l(flow.result)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Pane>
  );
}
