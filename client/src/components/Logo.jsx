const Logo = ({ size = 24, className = "" }) => (
  <img
    src="/logo.svg"
    alt="BinAthar Motors"
    width={size}
    height={size}
    className={`inline-block ${className}`}
  />
);

export default Logo;
