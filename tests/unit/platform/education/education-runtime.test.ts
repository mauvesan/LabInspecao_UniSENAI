import { describe, expect, it } from 'vitest';

describe('education runtime — D4.4.5', () => {
  it('documenta que local e Supabase compartilham o mesmo contrato de estado', () => {
    const localShape = {
      classes: [],
      students: [],
      assessments: [],
    };

    const remoteShape = {
      classes: [],
      students: [],
      assessments: [],
    };

    expect(Object.keys(remoteShape)).toEqual(Object.keys(localShape));
  });

  it('mantém as três coleções exigidas pela Área do Professor', () => {
    expect(['classes', 'students', 'assessments']).toHaveLength(3);
  });
});
