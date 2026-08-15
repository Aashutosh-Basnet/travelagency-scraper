const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-Node.js ZIP generator (no external dependencies required)
class SimpleZip {
  constructor() {
    this.files = [];
  }

  addFile(filePath, content) {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const crc = this.crc32(data);
    const compressed = zlib.deflateRawSync(data);
    this.files.push({
      path: filePath.replace(/\\/g, '/'),
      data,
      compressed,
      crc,
    });
  }

  crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ SimpleZip.crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  toBuffer() {
    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    for (const file of this.files) {
      const pathBuf = Buffer.from(file.path, 'utf8');
      const useCompressed = file.compressed.length < file.data.length;
      const compData = useCompressed ? file.compressed : file.data;
      const compMethod = useCompressed ? 8 : 0;

      // Local Header
      const lh = Buffer.alloc(30 + pathBuf.length);
      lh.writeUInt32LE(0x04034b50, 0); // signature
      lh.writeUInt16LE(20, 4); // version needed
      lh.writeUInt16LE(0, 6); // flags
      lh.writeUInt16LE(compMethod, 8); // compression
      lh.writeUInt16LE(0, 10); // mod time
      lh.writeUInt16LE(0, 12); // mod date
      lh.writeUInt32LE(file.crc, 14); // crc32
      lh.writeUInt32LE(compData.length, 18); // comp size
      lh.writeUInt32LE(file.data.length, 22); // uncomp size
      lh.writeUInt16LE(pathBuf.length, 26); // file name length
      lh.writeUInt16LE(0, 28); // extra field length
      pathBuf.copy(lh, 30);

      localHeaders.push(lh, compData);

      // Central Directory Header
      const cd = Buffer.alloc(46 + pathBuf.length);
      cd.writeUInt32LE(0x02014b50, 0); // signature
      cd.writeUInt16LE(20, 4); // version made by
      cd.writeUInt16LE(20, 6); // version needed
      cd.writeUInt16LE(0, 8); // flags
      cd.writeUInt16LE(compMethod, 10); // compression
      cd.writeUInt16LE(0, 12); // mod time
      cd.writeUInt16LE(0, 14); // mod date
      cd.writeUInt32LE(file.crc, 16); // crc32
      cd.writeUInt32LE(compData.length, 20); // comp size
      cd.writeUInt32LE(file.data.length, 24); // uncomp size
      cd.writeUInt16LE(pathBuf.length, 28); // file name length
      cd.writeUInt16LE(0, 30); // extra field length
      cd.writeUInt16LE(0, 32); // comment length
      cd.writeUInt16LE(0, 34); // disk start
      cd.writeUInt16LE(0, 36); // internal attr
      cd.writeUInt32LE(0, 38); // external attr
      cd.writeUInt32LE(offset, 42); // relative offset of local header
      pathBuf.copy(cd, 46);

      centralHeaders.push(cd);
      offset += lh.length + compData.length;
    }

    const cdStart = offset;
    const cdBuffer = Buffer.concat(centralHeaders);
    const cdSize = cdBuffer.length;

    // End of Central Directory Record
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // signature
    eocd.writeUInt16LE(0, 4); // disk number
    eocd.writeUInt16LE(0, 6); // cd disk number
    eocd.writeUInt16LE(this.files.length, 8); // records on disk
    eocd.writeUInt16LE(this.files.length, 10); // total records
    eocd.writeUInt32LE(cdSize, 12); // size of cd
    eocd.writeUInt32LE(cdStart, 16); // offset of cd
    eocd.writeUInt16LE(0, 20); // comment length

    return Buffer.concat([...localHeaders, cdBuffer, eocd]);
  }
}

SimpleZip.crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

// XML Templates generator for OpenXML PPTX
function buildPptx() {
  const zip = new SimpleZip();

  // [Content_Types].xml
  let contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`;

  for (let i = 1; i <= 10; i++) {
    contentTypes += `\n  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  }
  contentTypes += `\n</Types>`;
  zip.addFile('[Content_Types].xml', contentTypes);

  // _rels/.rels
  zip.addFile(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
  );

  // docProps/app.xml
  zip.addFile(
    'docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Editorial Presentation Engine</Application>
  <Slides>10</Slides>
</Properties>`
  );

  // docProps/core.xml
  zip.addFile(
    'docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:title>Editorial: Full-Stack Blog Platform</dc:title>
  <dc:creator>Antigravity</dc:creator>
</cp:coreProperties>`
  );

  // ppt/presentation.xml
  let sIdList = '';
  let pRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>`;

  for (let i = 1; i <= 10; i++) {
    const rId = `rId${i + 2}`;
    sIdList += `<p:sldId id="${255 + i}" r:id="${rId}"/>`;
    pRels += `\n  <Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
  }
  pRels += `\n</Relationships>`;

  zip.addFile(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${sIdList}
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
  );

  zip.addFile('ppt/_rels/presentation.xml.rels', pRels);

  // ppt/theme/theme1.xml
  zip.addFile(
    'ppt/theme/theme1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Editorial Dark">
  <a:themeElements>
    <a:clrScheme name="Editorial">
      <a:dk1><a:srgbClr val="09090B"/></a:dk1>
      <a:lt1><a:srgbClr val="F8FAFC"/></a:lt1>
      <a:dk2><a:srgbClr val="18181B"/></a:dk2>
      <a:lt2><a:srgbClr val="E2E8F0"/></a:lt2>
      <a:accent1><a:srgbClr val="8B5CF6"/></a:accent1>
      <a:accent2><a:srgbClr val="06B6D4"/></a:accent2>
      <a:accent3><a:srgbClr val="10B981"/></a:accent3>
      <a:accent4><a:srgbClr val="F59E0B"/></a:accent4>
      <a:accent5><a:srgbClr val="EC4899"/></a:accent5>
      <a:accent6><a:srgbClr val="6366F1"/></a:accent6>
      <a:hlink><a:srgbClr val="8B5CF6"/></a:hlink>
      <a:folHlink><a:srgbClr val="06B6D4"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Editorial">
      <a:majorFont><a:latin typeface="Plus Jakarta Sans"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Inter"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Editorial">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="dk1"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`
  );

  // ppt/slideMasters/slideMaster1.xml
  zip.addFile(
    'ppt/slideMasters/slideMaster1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="09090B"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`
  );

  zip.addFile(
    'ppt/slideMasters/_rels/slideMaster1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`
  );

  // ppt/slideLayouts/slideLayout1.xml
  zip.addFile(
    'ppt/slideLayouts/slideLayout1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
</p:sldLayout>`
  );

  zip.addFile(
    'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`
  );

  // Helper function to build Slide XML
  function createSlideXml(elements) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="09090B"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${elements}
    </p:spTree>
  </p:cSld>
</p:sld>`;
  }

  // XML building helper functions
  let spIdCounter = 2;

  function makeCard(x, y, cx, cy, borderColor = '8B5CF6', bgColor = '121215') {
    const id = spIdCounter++;
    return `<p:sp>
      <p:nvSpPr><p:cNvPr id="${id}" name="Card ${id}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
      <p:spPr>
        <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
        <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2000"/></a:avLst></a:prstGeom>
        <a:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill>
        <a:ln w="12700"><a:solidFill><a:srgbClr val="${borderColor}"/></a:solidFill></a:ln>
      </p:spPr>
    </p:sp>`;
  }

  function makeTextBox(x, y, cx, cy, paragraphs) {
    const id = spIdCounter++;
    const pXml = paragraphs
      .map(
        (p) => `<a:p>
          <a:pPr ${p.align ? `algn="${p.align}"` : ''} ${p.bullet ? 'marL="288000" indent="-288000"' : ''}>
            ${p.bullet ? '<a:buClr><a:srgbClr val="8B5CF6"/></a:buClr><a:buChar char="•"/>' : '<a:buNone/>'}
          </a:pPr>
          <a:r>
            <a:rPr lang="en-US" sz="${Math.round((p.size || 14) * 100)}" b="${p.bold ? 1 : 0}" ${p.italic ? 'i="1"' : ''}>
              <a:solidFill><a:srgbClr val="${p.color || 'F8FAFC'}"/></a:solidFill>
              <a:latin typeface="${p.font || 'Plus Jakarta Sans'}"/>
            </a:rPr>
            <a:t>${escapeXml(p.text)}</a:t>
          </a:r>
        </a:p>`
      )
      .join('');

    return `<p:sp>
      <p:nvSpPr><p:cNvPr id="${id}" name="Text ${id}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
      <p:spPr>
        <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        <a:noFill/>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square" rtlCol="0"><a:spAutoFit/></a:bodyPr>
        <a:lstStyle/>
        ${pXml}
      </p:txBody>
    </p:sp>`;
  }

  function escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function makeHeader(tag, title, subtitle, slideNum) {
    let res = '';
    // Tag
    res += makeTextBox(762000, 457200, 3810000, 304800, [
      { text: tag, size: 10, bold: true, color: '8B5CF6' },
    ]);
    // Title
    res += makeTextBox(762000, 762000, 10668000, 609600, [
      { text: title, size: 24, bold: true, color: 'FFFFFF' },
    ]);
    // Subtitle
    if (subtitle) {
      res += makeTextBox(762000, 1371600, 10668000, 381000, [
        { text: subtitle, size: 12, color: '94A3B8' },
      ]);
    }
    // Footer
    res += makeTextBox(762000, 6248400, 8000000, 304800, [
      { text: 'Editorial Platform — Full-Stack Blog Architecture', size: 9, color: '64748B' },
    ]);
    res += makeTextBox(10000000, 6248400, 1400000, 304800, [
      { text: `Slide ${slideNum} / 10`, size: 9, color: '64748B', align: 'r' },
    ]);
    return res;
  }

  // --- SLIDE 1: Title Slide ---
  let s1Xml = '';
  s1Xml += makeTextBox(914400, 1524000, 10000000, 381000, [
    { text: 'FULL-STACK PUBLISHING ARCHITECTURE', size: 11, bold: true, color: '8B5CF6' },
  ]);
  s1Xml += makeTextBox(914400, 1981200, 10500000, 914400, [
    { text: 'Editorial Platform', size: 36, bold: true, color: 'FFFFFF' },
  ]);
  s1Xml += makeTextBox(914400, 2971800, 10500000, 609600, [
    {
      text: 'A Dark Modern Minimalist Publishing Platform with MongoDB Session Auth, REST APIs & React Vite',
      size: 14,
      color: 'CBD5E1',
    },
  ]);

  s1Xml += makeCard(914400, 3962400, 3251200, 1828800, '8B5CF6', '121215');
  s1Xml += makeTextBox(1066800, 4114800, 2946400, 1524000, [
    { text: '⚡ Express + MongoDB', size: 14, bold: true, color: '8B5CF6' },
    { text: 'Session auth with MongoStore & bcrypt password hashing.', size: 11, color: '94A3B8' },
  ]);

  s1Xml += makeCard(4470400, 3962400, 3251200, 1828800, '06B6D4', '121215');
  s1Xml += makeTextBox(4622800, 4114800, 2946400, 1524000, [
    { text: '🎨 React 18 + Vite', size: 14, bold: true, color: '06B6D4' },
    { text: 'Tailwind CSS, Glassmorphism, Theme Toggle & Lucide icons.', size: 11, color: '94A3B8' },
  ]);

  s1Xml += makeCard(8026400, 3962400, 3251200, 1828800, '10B981', '121215');
  s1Xml += makeTextBox(8178800, 4114800, 2946400, 1524000, [
    { text: '🌐 Public Tunneling', size: 14, bold: true, color: '10B981' },
    { text: 'Zero-config ngrok & localtunnel integration with trust proxy.', size: 11, color: '94A3B8' },
  ]);

  zip.addFile('ppt/slides/slide1.xml', createSlideXml(s1Xml));

  // --- SLIDE 2: Goals & Problem Statement ---
  let s2Xml = makeHeader('PROJECT GOALS', 'Problem Statement & Solutions', 'Addressing common architectural pitfalls in web publishing platforms.', 2);
  s2Xml += makeCard(762000, 1981200, 5181600, 4114800, '334155', '121215');
  s2Xml += makeTextBox(990600, 2209800, 4724400, 457200, [{ text: 'Key Challenges Addressed', size: 14, bold: true, color: 'F87171' }]);
  s2Xml += makeTextBox(990600, 2743200, 4724400, 3200400, [
    { text: 'JWT Invalidation Risks: Stateless tokens cannot be securely invalidated immediately on logout without Redis/DB blocklists.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'UI Clutter & Bloat: Heavy card shadows and arbitrary gradients harm reading comfort.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Author Data Leaks: Risk of exposing private drafts without strict user-level author isolation.', size: 11, color: 'CBD5E1', bullet: true },
  ]);

  s2Xml += makeCard(6248400, 1981200, 5181600, 4114800, '8B5CF6', '121215');
  s2Xml += makeTextBox(6477000, 2209800, 4724400, 457200, [{ text: 'Core Architectural Solutions', size: 14, bold: true, color: '10B981' }]);
  s2Xml += makeTextBox(6477000, 2743200, 4724400, 3200400, [
    { text: 'MongoDB Persistent Sessions: Server-side express-session with connect-mongo guarantees real-time session destruction.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Dark Modern Minimalist Design: Obsidian dark canvas, neon accents, and Plus Jakarta Sans typography.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Rich Authoring & Reading: Live markdown preview, drag-and-drop cover banner, and floating Table of Contents.', size: 11, color: 'CBD5E1', bullet: true },
  ]);
  zip.addFile('ppt/slides/slide2.xml', createSlideXml(s2Xml));

  // --- SLIDE 3: System Architecture ---
  let s3Xml = makeHeader('SYSTEM ARCHITECTURE', 'End-to-End System Flow & Tech Stack', 'Decoupled MERN architecture with seamless reverse proxy relaying.', 3);
  s3Xml += makeCard(762000, 1981200, 3352800, 4114800, '06B6D4', '121215');
  s3Xml += makeTextBox(990600, 2209800, 2895600, 609600, [
    { text: '1. Frontend Layer\n(Port 5173)', size: 13, bold: true, color: '06B6D4' },
    { text: '• React 18 with Vite\n• React Router DOM\n• Tailwind CSS (v3)\n• Lucide React Icons\n• AuthContext & ThemeContext\n• ToastContext System', size: 10.5, color: 'CBD5E1' },
  ]);

  s3Xml += makeCard(4419600, 1981200, 3352800, 4114800, '8B5CF6', '121215');
  s3Xml += makeTextBox(4648200, 2209800, 2895600, 609600, [
    { text: '2. Backend API Layer\n(Port 5000)', size: 13, bold: true, color: '8B5CF6' },
    { text: '• Node.js & Express\n• express-session (MongoStore)\n• bcrypt (10 salt rounds)\n• Multer image file handler\n• Dynamic CORS & Trust Proxy\n• requireAuth Middleware', size: 10.5, color: 'CBD5E1' },
  ]);

  s3Xml += makeCard(8077200, 1981200, 3352800, 4114800, '10B981', '121215');
  s3Xml += makeTextBox(8305800, 2209800, 2895600, 609600, [
    { text: '3. Database Layer\n(MongoDB)', size: 13, bold: true, color: '10B981' },
    { text: '• User collection (unique emails)\n• Post collection (compound index)\n• Sessions collection (MongoStore)\n• Static /uploads file storage\n• Mongoose schemas & validation', size: 10.5, color: 'CBD5E1' },
  ]);
  zip.addFile('ppt/slides/slide3.xml', createSlideXml(s3Xml));

  // --- SLIDE 4: Session Auth & Security ---
  let s4Xml = makeHeader('SECURITY & AUTH', 'Session Authentication & bcrypt Security', 'Preventing XSS and token leaks with httpOnly session cookies and bcrypt.', 4);
  s4Xml += makeCard(762000, 1981200, 5181600, 4114800, '334155', '121215');
  s4Xml += makeTextBox(990600, 2209800, 4724400, 457200, [{ text: 'Session Security Workflow', size: 14, bold: true, color: 'FFFFFF' }]);
  s4Xml += makeTextBox(990600, 2743200, 4724400, 3200400, [
    { text: '1. User registers or logs in with email & password.', size: 11, color: 'CBD5E1' },
    { text: '2. Server salts & hashes password with bcrypt (10 rounds).', size: 11, color: 'CBD5E1' },
    { text: '3. Session is created in MongoDB; only req.session.userId is stored.', size: 11, color: 'CBD5E1' },
    { text: '4. Server responds with httpOnly, sameSite: lax cookie (connect.sid).', size: 11, color: 'CBD5E1' },
    { text: '5. Logout destroys session in MongoDB and erases cookie from browser.', size: 11, color: 'CBD5E1' },
  ]);

  s4Xml += makeCard(6248400, 1981200, 5181600, 4114800, '8B5CF6', '121215');
  s4Xml += makeTextBox(6477000, 2209800, 4724400, 457200, [{ text: 'Why Sessions Over JWT Here', size: 14, bold: true, color: '8B5CF6' }]);
  s4Xml += makeTextBox(6477000, 2743200, 4724400, 3200400, [
    { text: 'Instant Server-Side Revocation: Banned or logged-out users lose access immediately.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Zero Client-Side Secret Storage: No JWT tokens stored in localStorage vulnerable to XSS.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Auto Expiring Sessions: MongoStore TTL automatically clears inactive session documents.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Sensitive Data Stripping: User passwordHash is never sent to the client.', size: 11, color: 'CBD5E1', bullet: true },
  ]);
  zip.addFile('ppt/slides/slide4.xml', createSlideXml(s4Xml));

  // --- SLIDE 5: REST API & Feed ---
  let s5Xml = makeHeader('REST API', 'Post Management & Public Feed APIs', 'Strict user data isolation and optimized public retrieval endpoints.', 5);
  s5Xml += makeCard(762000, 1981200, 5181600, 4114800, '334155', '121215');
  s5Xml += makeTextBox(990600, 2209800, 4724400, 457200, [{ text: 'Public Reader Endpoints', size: 14, bold: true, color: '06B6D4' }]);
  s5Xml += makeTextBox(990600, 2743200, 4724400, 3200400, [
    { text: 'GET /api/posts/public — Returns all published stories across all authors. Supports query search (?search=...) and tag filter (?tag=...).', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'GET /api/posts/public/:id — Public reader view for specific published post.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Author Population: Author name and email are populated while passwordHash is excluded.', size: 11, color: 'CBD5E1', bullet: true },
  ]);

  s5Xml += makeCard(6248400, 1981200, 5181600, 4114800, '8B5CF6', '121215');
  s5Xml += makeTextBox(6477000, 2209800, 4724400, 457200, [{ text: 'Protected Author Endpoints', size: 14, bold: true, color: '8B5CF6' }]);
  s5Xml += makeTextBox(6477000, 2743200, 4724400, 3200400, [
    { text: 'GET /api/posts — Returns ONLY the logged-in user\'s personal posts and drafts.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'POST /api/posts — Creates post attached to req.session.userId with Multer upload.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'PUT & DELETE /api/posts/:id — Verifies post.author === req.session.userId. Returns 403 Forbidden for any unauthorized attempt.', size: 11, color: 'CBD5E1', bullet: true },
  ]);
  zip.addFile('ppt/slides/slide5.xml', createSlideXml(s5Xml));

  // --- SLIDE 6: UI & Design Vision ---
  let s6Xml = makeHeader('DESIGN SYSTEM', 'Dark Modern Minimalist Design System', 'Obsidian dark foundations, glowing neon accents, and Plus Jakarta Sans.', 6);
  s6Xml += makeCard(762000, 1981200, 3352800, 4114800, '8B5CF6', '121215');
  s6Xml += makeTextBox(990600, 2209800, 2895600, 3600000, [
    { text: 'Obsidian Glass Theme', size: 13, bold: true, color: 'FFFFFF' },
    { text: '• Deep obsidian (#09090b)\n• Frosted glassmorphism panels\n• Ambient radial mesh glows\n• Plus Jakarta Sans & Inter fonts', size: 11, color: '94A3B8' },
  ]);

  s6Xml += makeCard(4419600, 1981200, 3352800, 4114800, '06B6D4', '121215');
  s6Xml += makeTextBox(4648200, 2209800, 2895600, 3600000, [
    { text: 'Electric Neon Accents', size: 13, bold: true, color: '06B6D4' },
    { text: '• Electric violet & cyan highlights\n• Glowing active category pills\n• Hover card elevation & zoom\n• Shimmering skeleton loaders', size: 11, color: '94A3B8' },
  ]);

  s6Xml += makeCard(8077200, 1981200, 3352800, 4114800, '10B981', '121215');
  s6Xml += makeTextBox(8305800, 2209800, 2895600, 3600000, [
    { text: 'Animated Theme Toggle', size: 13, bold: true, color: '10B981' },
    { text: '• Seamless Dark & Light switch\n• Rotating Sun/Moon icon\n• LocalStorage persistence\n• High contrast & accessible', size: 11, color: '94A3B8' },
  ]);
  zip.addFile('ppt/slides/slide6.xml', createSlideXml(s6Xml));

  // --- SLIDE 7: Key Interactive Features ---
  let s7Xml = makeHeader('INTERACTIVE FEATURES', 'Reader & Writer Interactive Features', 'Rich micro-interactions designed to make reading and writing enjoyable.', 7);
  s7Xml += makeCard(762000, 1981200, 5181600, 4114800, '8B5CF6', '121215');
  s7Xml += makeTextBox(990600, 2209800, 4724400, 457200, [{ text: 'Reader Experience Enhancements', size: 14, bold: true, color: '8B5CF6' }]);
  s7Xml += makeTextBox(990600, 2743200, 4724400, 3200400, [
    { text: 'Sticky Reading Progress Bar: Gradient glowing bar tracking scroll depth.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Dynamic Floating TOC: Parses markdown headings (##, ###) with active section tracking.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Interactive Clap Button: Emits floating +1 particle animations on applause.', size: 11, color: 'CBD5E1', bullet: true },
    { text: '1-Click Share: Copy story link with animated checkmark and toast alert.', size: 11, color: 'CBD5E1', bullet: true },
  ]);

  s7Xml += makeCard(6248400, 1981200, 5181600, 4114800, '06B6D4', '121215');
  s7Xml += makeTextBox(6477000, 2209800, 4724400, 457200, [{ text: 'Writer Experience Enhancements', size: 14, bold: true, color: '06B6D4' }]);
  s7Xml += makeTextBox(6477000, 2743200, 4724400, 3200400, [
    { text: 'Dual-Pane Markdown Preview: Write vs Live Preview tabs.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Drag & Drop Cover Banner: Instant photo preview, replace, and removal.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Studio Analytics Cards: Total stories, published, drafts, and words written.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Tag Suggestion Chips: Quick-add popular topics with one click.', size: 11, color: 'CBD5E1', bullet: true },
  ]);
  zip.addFile('ppt/slides/slide7.xml', createSlideXml(s7Xml));

  // --- SLIDE 8: Sharing with ngrok ---
  let s8Xml = makeHeader('PUBLIC SHARING', 'Instant Sharing with ngrok & localtunnel', 'Zero-config tunnel relaying with first-party cookie preservation.', 8);
  s8Xml += makeCard(762000, 1981200, 5181600, 4114800, '10B981', '121215');
  s8Xml += makeTextBox(990600, 2209800, 4724400, 457200, [{ text: 'Why Single-Port Tunneling Works', size: 14, bold: true, color: '10B981' }]);
  s8Xml += makeTextBox(990600, 2743200, 4724400, 3200400, [
    { text: 'Vite Reverse Proxy: Only port 5173 is exposed. Vite relays /api and /uploads to Express on port 5000.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Same-Origin Cookie Security: Browsers send session cookies because client and API share the tunnel domain.', size: 11, color: 'CBD5E1', bullet: true },
    { text: 'Express Trust Proxy: app.set("trust proxy", 1) guarantees HTTPS headers are recognized over tunnels.', size: 11, color: 'CBD5E1', bullet: true },
  ]);

  s8Xml += makeCard(6248400, 1981200, 5181600, 4114800, '8B5CF6', '121215');
  s8Xml += makeTextBox(6477000, 2209800, 4724400, 457200, [{ text: 'Instant 1-Click Launch Scripts', size: 14, bold: true, color: '8B5CF6' }]);
  s8Xml += makeTextBox(6477000, 2743200, 4724400, 3200400, [
    { text: '1. Option A (localtunnel — Zero setup):\n   npm run share  (or double-click start-tunnel.bat)\n\n2. Option B (Official ngrok):\n   ngrok http 5173\n\nFriends can browse, register, write stories, and give claps in real-time!', size: 11, color: 'CBD5E1' },
  ]);
  zip.addFile('ppt/slides/slide8.xml', createSlideXml(s8Xml));

  // --- SLIDE 9: Testing & Quality ---
  let s9Xml = makeHeader('TESTING & QUALITY', 'Automated E2E Testing & Security Matrix', 'Complete end-to-end verification of authentication barriers and data isolation.', 9);
  s9Xml += makeCard(762000, 1981200, 10668000, 4114800, '10B981', '121215');
  s9Xml += makeTextBox(990600, 2209800, 10200000, 457200, [{ text: 'Automated Test Suite (server/test_backend.js)', size: 14, bold: true, color: '10B981' }]);
  s9Xml += makeTextBox(990600, 2743200, 10200000, 3200400, [
    { text: '✓ Test 1: Server Health Check returns 200 OK.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 2: User signup hashes password with bcrypt; passwordHash is never exposed.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 3: Session persistence verified via GET /api/auth/me.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 4 & 5: Published vs Draft post creation and privacy status.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 6 & 7: User isolation check: User B cannot access User A\'s private drafts.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 8: Security barrier: User B attempting to edit or delete User A\'s post returns 403 Forbidden.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 9: Public feed filtering returns published stories only.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 10 & 11: Owner update and deletion verified.', size: 10.5, color: 'CBD5E1' },
    { text: '✓ Test 12: Logout destroys session in MongoDB; subsequent requests return 401 Unauthorized.', size: 10.5, color: 'CBD5E1' },
  ]);
  zip.addFile('ppt/slides/slide9.xml', createSlideXml(s9Xml));

  // --- SLIDE 10: Conclusion ---
  let s10Xml = makeHeader('CONCLUSION', 'Summary & Key Takeaways', 'A complete, modern, robust, and scalable editorial publishing platform.', 10);
  s10Xml += makeCard(762000, 1981200, 3352800, 4114800, '8B5CF6', '121215');
  s10Xml += makeTextBox(990600, 2209800, 2895600, 3600000, [
    { text: 'Production-Grade Auth', size: 13, bold: true, color: '8B5CF6' },
    { text: '• Server-side MongoDB sessions\n• bcrypt password hashing\n• Strict author ownership checks\n• Automated E2E test suite', size: 11, color: '94A3B8' },
  ]);

  s10Xml += makeCard(4419600, 1981200, 3352800, 4114800, '06B6D4', '121215');
  s10Xml += makeTextBox(4648200, 2209800, 2895600, 3600000, [
    { text: 'Refined Visual Craft', size: 13, bold: true, color: '06B6D4' },
    { text: '• Dark modern minimalist design\n• Animated theme toggle\n• Live dual-pane editor preview\n• Floating TOC & progress bar', size: 11, color: '94A3B8' },
  ]);

  s10Xml += makeCard(8077200, 1981200, 3352800, 4114800, '10B981', '121215');
  s10Xml += makeTextBox(8305800, 2209800, 2895600, 3600000, [
    { text: 'Publicly Shareable', size: 13, bold: true, color: '10B981' },
    { text: '• 1-click ngrok & localtunnel\n• Zero-config friend sharing\n• Full documentation guides\n• Interactive presentation deck', size: 11, color: '94A3B8' },
  ]);
  zip.addFile('ppt/slides/slide10.xml', createSlideXml(s10Xml));

  // Slide rels
  for (let i = 1; i <= 10; i++) {
    zip.addFile(
      `ppt/slides/_rels/slide${i}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`
    );
  }

  // Write PPTX file
  const outPath = path.join(__dirname, '..', 'Editorial_Platform_Presentation.pptx');
  const buffer = zip.toBuffer();
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Presentation created at: ${outPath} (${buffer.length} bytes)`);
}

buildPptx();
