function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      service: 'LabInspeção 4.0',
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  try {
    const token = String(e.parameter.token || ''),
      expected = PropertiesService.getScriptProperties().getProperty('ACCESS_TOKEN');
    if (!expected || token !== expected) return json_({ ok: false, error: 'unauthorized' });
    const payload = JSON.parse(e.parameter.payload || '{}');
    console.log(JSON.stringify(payload));
    return json_({ ok: true, attemptId: payload.attemptId });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}
function json_(v) {
  return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
