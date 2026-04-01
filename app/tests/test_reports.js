const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ConsumptionReportQuery, RecentMovementsQuery } = require('../schemas/report.schema');

test('ConsumptionReportQuery — varsayılan limit', () => {
  const { error, value } = ConsumptionReportQuery.validate({});
  assert.equal(error, undefined);
  assert.equal(value.limit, 10);
});

test('RecentMovementsQuery', () => {
  const { error, value } = RecentMovementsQuery.validate({ limit: '15' });
  assert.equal(error, undefined);
  assert.equal(value.limit, 15);
});
