## Runtime Notes
- This project is configured with `nodejs_compat` to maximize compatibility with Node APIs.
- For best performance on Cloudflare, prefer the Edge runtime in route handlers:
  ```ts
  export const runtime = 'edge'
  ```
- If a specific API needs Node, omit the above and rely on `nodejs_compat`.
