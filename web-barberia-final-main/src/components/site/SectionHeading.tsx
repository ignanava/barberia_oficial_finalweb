interface Props {
  kicker: string;
  title: string;
  description?: string;
  light?: boolean;
}

export default function SectionHeading({ kicker, title, description, light = false }: Props) {
  return <div className={`section-heading${light ? ' light-heading' : ''}`}>
    <span className="section-kicker">{kicker}</span>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>;
}
