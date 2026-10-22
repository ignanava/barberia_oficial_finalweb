export default function StatusBadge({ status }: { status: string }) {
  const tone = ['Cancelada', 'Cancelado'].includes(status) ? 'cancelled'
    : ['Atendida', 'Entregado'].includes(status) ? 'completed'
      : status === 'Listo para recoger' ? 'ready' : 'active';
  return <span className={`status-pill status-${tone}`}>{status}</span>;
}
