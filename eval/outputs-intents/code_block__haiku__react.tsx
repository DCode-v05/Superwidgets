import React from "react";

export default function CodeBlock() {
  const [copied, setCopied] = React.useState(false);

  const code = `import time
import requests
from typing import Optional

def fetch_with_retries(
    url: str,
    max_retries: int = 5,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    timeout: int = 10,
) -> Optional[requests.Response]:
    """
    Fetch a URL with exponential backoff retry logic.
    
    Args:
        url: The URL to fetch
        max_retries: Maximum number of retry attempts (default: 5)
        initial_delay: Initial delay in seconds (default: 1.0)
        backoff_factor: Multiplier for delay after each retry (default: 2.0)
        timeout: Request timeout in seconds (default: 10)
    
    Returns:
        requests.Response object if successful, None if all retries exhausted
    """
    delay = initial_delay
    
    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1}/{max_retries}: Fetching {url}")
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            print(f"✓ Success on attempt {attempt + 1}")
            return response
            
        except requests.exceptions.Timeout:
            print(f"✗ Timeout on attempt {attempt + 1}")
        except requests.exceptions.ConnectionError:
            print(f"✗ Connection error on attempt {attempt + 1}")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code < 500:
                # Don't retry on client errors
                print(f"✗ Client error {e.response.status_code} — not retrying")
                return None
            print(f"✗ Server error {e.response.status_code} on attempt {attempt + 1}")
        except Exception as e:
            print(f"✗ Unexpected error on attempt {attempt + 1}: {e}")
        
        # Stop if this was the last attempt
        if attempt == max_retries - 1:
            print(f"✗ All {max_retries} attempts exhausted")
            return None
        
        # Wait before next retry
        print(f"  Waiting {delay}s before retry...")
        time.sleep(delay)
        delay *= backoff_factor
    
    return None


# Example usage:
if __name__ == "__main__":
    response = fetch_with_retries(
        "https://api.example.com/data",
        max_retries=4,
        initial_delay=2.0,
        backoff_factor=2.0,
    )
    
    if response:
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")
    else:
        print("Failed to fetch after all retries")`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: "#0f1116",
        color: "#e6e6e6",
        borderRadius: 14,
        padding: 0,
        overflow: "hidden",
        fontFamily: '"SF Mono", "Monaco", monospace',
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#16181f",
          padding: "12px 16px",
          borderBottom: "1px solid #333",
        }}
      >
        <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>
          fetch_with_retries.py
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? "#2ea043" : "#333",
            color: "#fff",
            border: 0,
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 16,
          overflow: "auto",
          maxHeight: 480,
          fontSize: 12,
          lineHeight: 1.5,
          color: "#e6e6e6",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}