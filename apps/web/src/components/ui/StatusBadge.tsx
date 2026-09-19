import type { ServiceTicket } from '@econav/platform';

const STATUS_CLASS: Record<ServiceTicket['status'], string> = {
  submitted: 'status-submitted',
  assigned: 'status-assigned',
  in_progress: 'status-progress',
  resolved: 'status-resolved',
  closed: 'status-closed',
  escalated: 'status-escalated',
};

export function StatusBadge({ status }: { status: ServiceTicket['status'] }) {
  const label = status.replace(/_/g, ' ');
  return <span className={`status-pill ${STATUS_CLASS[status] ?? ''}`}>{label}</span>;
}

export function slaLabel(ticket: ServiceTicket): { text: string; tone: 'ok' | 'warn' | 'danger' } {
  if (['resolved', 'closed'].includes(ticket.status)) {
    return { text: 'Closed', tone: 'ok' };
  }
  const ageHours = (Date.now() - new Date(ticket.createdAt).getTime()) / 3_600_000;
  const remaining = ticket.slaHours - ageHours;
  if (remaining <= 0) return { text: 'SLA breached', tone: 'danger' };
  if (remaining <= ticket.slaHours * 0.25) {
    return { text: `${Math.ceil(remaining)}h left in SLA`, tone: 'warn' };
  }
  return { text: `${Math.ceil(remaining)}h left in SLA`, tone: 'ok' };
}
