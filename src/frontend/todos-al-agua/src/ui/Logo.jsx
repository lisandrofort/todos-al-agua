import "./Logo.css";

export default function Logo({
  href,
  title = "Todos al Agua",
  subtitle = "Necochea",
  className = "",
}) {
  const classes = ["brand", className].filter(Boolean).join(" ");

  const content = (
    <>
      <img
        className="brand-logo"
        src="/asociacion-civil-todos-al-agua-transparente.png"
        alt=""
        width="432"
        height="260"
      />
      <span className="brand-text">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        aria-label={`${title} ${subtitle}, ir al inicio`}
      >
        {content}
      </a>
    );
  }

  return <span className={classes}>{content}</span>;
}
