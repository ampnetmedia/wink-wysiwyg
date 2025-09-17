import React from "react";

const WInkNoSSR: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  if (!isClient) return <>{fallback}</>;
  return <>{children}</>;
};

export default WInkNoSSR;
