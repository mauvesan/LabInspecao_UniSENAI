function decodeEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function parseDelimitedText(text, delimiter = null) {
  const firstLine = String(text).split(/\r?\n/, 1)[0] || '';
  const sep = delimiter || (firstLine.split(';').length > firstLine.split(',').length ? ';' : ',');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const source = String(text).replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (char === sep && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      row.push(cell);
      cell = '';
      if (row.some((item) => item !== '')) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((item) => item.trim());
  return rows
    .slice(1)
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
    );
}

function readU16(view, offset) {
  return view.getUint16(offset, true);
}
function readU32(view, offset) {
  return view.getUint32(offset, true);
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined')
    throw new Error('XLSX requer suporte do navegador a DecompressionStream.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzipEntries(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const entries = new Map();
  for (let offset = 0; offset + 30 <= bytes.length;) {
    if (readU32(view, offset) !== 0x04034b50) {
      offset += 1;
      continue;
    }
    const method = readU16(view, offset + 8);
    const compressedSize = readU32(view, offset + 18);
    const fileNameLength = readU16(view, offset + 26);
    const extraLength = readU16(view, offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + fileNameLength));
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    let content;
    if (method === 0) content = compressed;
    else if (method === 8) content = await inflateRaw(compressed);
    else throw new Error(`Método ZIP não suportado no XLSX: ${method}`);
    entries.set(name, content);
    offset = dataStart + compressedSize;
  }
  return entries;
}

function xmlText(bytes) {
  return new TextDecoder('utf-8').decode(bytes || new Uint8Array());
}

function parseSharedStrings(xml) {
  const strings = [];
  for (const match of xml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)) {
    const fragments = [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((part) =>
      decodeEntities(part[1]),
    );
    strings.push(fragments.join(''));
  }
  return strings;
}

function columnIndex(reference) {
  const letters =
    String(reference)
      .match(/[A-Z]+/i)?.[0]
      ?.toUpperCase() || 'A';
  return [...letters].reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function parseWorksheet(xml, sharedStrings) {
  const matrix = [];
  for (const rowMatch of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\s+([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = attrs.match(/\br="([^"]+)"/)?.[1] || 'A1';
      const type = attrs.match(/\bt="([^"]+)"/)?.[1] || '';
      const raw =
        body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? body.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? '';
      let value = decodeEntities(raw);
      if (type === 's') value = sharedStrings[Number.parseInt(value, 10)] ?? '';
      row[columnIndex(ref)] = value;
    }
    matrix.push(row.map((value) => value ?? ''));
  }
  if (!matrix.length) return [];
  const headers = matrix[0].map((value) => String(value).trim());
  return matrix
    .slice(1)
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
    );
}

export async function parseTabularFile(file) {
  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.csv')) return parseDelimitedText(await file.text());
  if (!name.endsWith('.xlsx')) throw new Error('Formato não suportado. Utilize CSV ou XLSX.');
  const entries = await unzipEntries(await file.arrayBuffer());
  const shared = parseSharedStrings(xmlText(entries.get('xl/sharedStrings.xml')));
  const worksheetName = [...entries.keys()].find((key) =>
    /^xl\/worksheets\/sheet\d+\.xml$/.test(key),
  );
  if (!worksheetName) throw new Error('XLSX sem planilha legível.');
  return parseWorksheet(xmlText(entries.get(worksheetName)), shared);
}
