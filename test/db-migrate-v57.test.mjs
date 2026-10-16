// test/db-migrate-v57.test.mjs — v57 = workspaces.scan_models_json, the per-workspace scan-model
// pick captured at creation. An INCREMENTAL_COLUMNS entry: a DB without the column gains it on
// open through the hoisted repairSchemaGaps + reconcileSchema (no ladder step of its own).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { useTempHome } from './helpers/temp-home.mjs';
import { getDb, SCHEMA_VERSION, _resetForTests } from '../src/core/db.mjs';

useTempHome(after);
const cols = (db, t) => db.prepare(`PRAGMA table_info(${t})`).all().map((r) => r.name);

test('a DB stamped 56 without workspaces.scan_models_json gains it; user_version reads the current version', () => {
  let db = getDb();
  assert.ok(SCHEMA_VERSION >= 57);
  db.exec('ALTER TABLE workspaces DROP COLUMN scan_models_json');
  db.exec('PRAGMA user_version = 56');
  assert.ok(!cols(db, 'workspaces').includes('scan_models_json'));
  _resetForTests();
  db = getDb();
  assert.ok(cols(db, 'workspaces').includes('scan_models_json'));
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, SCHEMA_VERSION);
});
