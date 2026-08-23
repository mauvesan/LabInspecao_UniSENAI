/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CALIBRATION_PROFILE,
  createAppliedActivitySnapshot,
  createPublicActivitySnapshot,
  createCaseVersion,
  diffCalibrationProfiles,
  exportPortableCase,
  importCaseRows,
  importPortableCase,
  importVehicleRows,
  validateCalibrationProfile,
} from '../../../src/modules/gases/teacher-library-model.js';
import { parseDelimitedText } from '../../../src/modules/gases/tabular-import.js';

describe('emissions teacher libraries', () => {
  it('ignora vehicle_id duplicado sem sobrescrever', () => {
    const existing = [{ vehicleId: 'SIM-1' }];
    const result = importVehicleRows(existing as any, [
      {
        vehicle_id: 'SIM-1',
        fabricante: 'A',
        modelo: 'B',
        ano_inicial: 2020,
        ano_modelo: 2020,
        combustivel: 'flex',
      },
    ]);
    expect(result.imported).toHaveLength(0);
    expect(result.ignored[0].status).toBe('IGNORED_DUPLICATE');
  });

  it('ignora case_id duplicado sem criar versão automaticamente', () => {
    const result = importCaseRows([{ caseId: 'CASE-1' }] as any, [
      {
        case_id: 'CASE-1',
        titulo: 'Caso',
        vehicle_id: 'SIM-1',
        dificuldade: 'basic',
        defeitos: 'misfire',
      },
    ]);
    expect(result.imported).toHaveLength(0);
    expect(result.ignored[0].status).toBe('IGNORED_DUPLICATE');
  });

  it('versiona caso somente por ação explícita', () => {
    const master = { caseId: 'CASE-1', version: 1, title: 'A' };
    const next = createCaseVersion(master as any, { title: 'B' });
    expect(next.version).toBe(2);
    expect(master.version).toBe(1);
  });

  it('snapshot público não expõe defeitos nem gabarito', () => {
    const master: any = {
      caseId: 'CASE-SEC',
      version: 1,
      title: 'Seguro',
      vehicleId: 'SIM-1',
      difficulty: 'basic',
      ethanolContent: 27,
      faults: [{ id: 'misfire', severity: 'mild' }],
      answerKey: { primaryFaultId: 'misfire' },
    };
    const snapshot = createPublicActivitySnapshot(master);
    expect(snapshot).not.toHaveProperty('faults');
    expect(snapshot).not.toHaveProperty('answerKey');
  });

  it('snapshot aplicado não muda quando caso mestre é alterado', () => {
    const master: any = {
      caseId: 'CASE-1',
      version: 1,
      title: 'A',
      vehicleId: 'SIM-1',
      difficulty: 'basic',
      ethanolContent: 27,
      faults: [{ id: 'misfire', severity: 'mild' }],
      remap: { injectionPct: 0, ignitionDeg: 0 },
    };
    const snapshot = createAppliedActivitySnapshot(master);
    master.title = 'ALTERADO';
    expect(snapshot.case.title).toBe('A');
  });

  it('pacote portátil é somente dados e respeita duplicidade', () => {
    const record: any = {
      caseId: 'CASE-X',
      version: 1,
      title: 'Caso X',
      vehicleId: 'SIM-1',
      difficulty: 'basic',
      ethanolContent: 27,
      faults: [{ id: 'misfire', severity: 'mild' }],
      remap: { injectionPct: 0, ignitionDeg: 0 },
    };
    const pkg = exportPortableCase(record);
    expect(pkg.policies.codeExecution).toBe('NEVER');
    expect(importPortableCase([{ caseId: 'CASE-X' }] as any, pkg).status).toBe('IGNORED_DUPLICATE');
  });

  it('valida calibração e registra diferenças', () => {
    const next: any = structuredClone(DEFAULT_CALIBRATION_PROFILE);
    next.version = 2;
    next.parameters.rpmOscillation = 50;
    expect(validateCalibrationProfile(next).valid).toBe(true);
    expect(diffCalibrationProfiles(DEFAULT_CALIBRATION_PROFILE as any, next)).toEqual(
      expect.arrayContaining([expect.objectContaining({ parameter: 'rpmOscillation' })]),
    );
  });

  it('parseia CSV com cabeçalho e campos entre aspas', () => {
    const rows = parseDelimitedText('case_id;titulo;vehicle_id\nCASE-1;"Teste; especial";SIM-1');
    expect(rows[0].titulo).toBe('Teste; especial');
  });
});
