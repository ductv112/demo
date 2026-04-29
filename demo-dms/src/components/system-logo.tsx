interface SystemLogoProps {
  size?: number;
  className?: string;
}

/**
 * Logo chính thức của hệ thống Doanh nghiệp A DMS.
 * Badge gradient gold chứa chữ "DA" (Doanh nghiệp A).
 */
export function SystemLogo({ size = 48, className = '' }: SystemLogoProps) {
  const fontSize = Math.round(size * 0.36);
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: 'linear-gradient(135deg, #D4A843 0%, #f0d890 100%)',
        boxShadow: '0 6px 20px rgba(212, 168, 67, 0.35)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0a1628',
        fontWeight: 800,
        fontSize,
        letterSpacing: '-0.5px',
      }}
      aria-label="Logo Doanh nghiệp A"
    >
      DA
    </div>
  );
}
