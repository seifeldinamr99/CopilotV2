import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function ShopifyCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Backend redirects here with `?connected=1`.
    // Close popup if possible; otherwise navigate back to home.
    try {
      window.opener?.postMessage({ type: "SHOPIFY_AUTH_SUCCESS" }, "*");
    } catch {
      // ignore
    }

    window.setTimeout(() => {
      try {
        window.close();
      } catch {
        // ignore
      }
      navigate("/", { replace: true });
    }, 200);
  }, [navigate]);

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Shopify connected. You can close this window.
    </div>
  );
}

