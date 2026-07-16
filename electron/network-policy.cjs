"use strict";

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

function isAllowedUrl(rawUrl, expectedPort) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (["data:", "blob:", "devtools:"].includes(url.protocol)) return true;
  if (!["http:", "https:"].includes(url.protocol)) return false;
  if (!LOCAL_HOSTS.has(url.hostname.toLowerCase())) return false;
  if (expectedPort && url.port && url.port !== String(expectedPort)) return false;
  return true;
}

function installNetworkPolicy(session, expectedPort, onBlocked = () => {}) {
  session.webRequest.onBeforeRequest(
    { urls: ["http://*/*", "https://*/*"] },
    (details, callback) => {
      const allowed = isAllowedUrl(details.url, expectedPort);
      if (!allowed) onBlocked(details.url);
      callback({ cancel: !allowed });
    },
  );
}

module.exports = { isAllowedUrl, installNetworkPolicy };
