export function inpostPinHtml(selected: boolean) {
  const size = selected ? 40 : 30;
  const icon = selected ? 18 : 14;
  const bg = selected ? "#D39058" : "#9C644E";
  const ring = selected ? "3px solid #fff" : "2px solid #fff";
  const parcel = `<svg width="${icon}" height="${icon}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2 20 7.5v9L12 20.8 4 16.5v-9L12 3.2Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 12.2 20 7.5M12 12.2 4 7.5M12 12.2V20.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${bg};border:${ring};box-shadow:0 2px 6px rgba(1,1,1,.3);display:flex;align-items:center;justify-content:center">${parcel}</div>`;
}

export function inpostClusterSize(count: number) {
  return count > 80 ? 52 : count > 20 ? 44 : 36;
}

export function inpostClusterHtml(count: number) {
  const size = inpostClusterSize(count);
  return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:#9C644E;border:2px solid #fff;box-shadow:0 2px 8px rgba(1,1,1,.28);display:flex;align-items:center;justify-content:center;color:#fff;font:600 13px/1 ui-monospace,monospace">${count}</div>`;
}
