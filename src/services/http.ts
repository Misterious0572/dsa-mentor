export async function request(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  const data = ct.includes("application/json") ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : { errorText: text };
  if (!res.ok) throw new Error(data.error || data.message || data.errorText || `${res.status} ${res.statusText}`);
  return data;
}
