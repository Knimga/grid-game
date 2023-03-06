import './keyValuePill.css';

interface KeyValuePillInput {label:string, value: string | number}

export default function KeyValuePill({label, value}: KeyValuePillInput) {
  return (
    <div className="pill">
        <div className="pill-label">{label}</div>
        <div className="pill-value">{value}</div>
    </div>
  )
}
