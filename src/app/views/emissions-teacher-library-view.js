import '../../styles/emissions-teacher-library.css';
import { createEmissionsTeacherLibraryService } from '../../modules/gases/teacher-library-service.js';
import {
  CALIBRATION_PARAMETER_DEFINITIONS,
  DEFAULT_CALIBRATION_PROFILE,
  createInitialVehicleLibrary,
  diffCalibrationProfiles,
  exportPortableCase,
  exportVehicleLibrary,
  importCaseRows,
  importVehicleRows,
  validateCalibrationProfile,
} from '../../modules/gases/teacher-library-model.js';
import { parseTabularFile } from '../../modules/gases/tabular-import.js';

function esc(value) {
  return String(value ?? '').replace(
    /[&<>'"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char],
  );
}
function downloadJson(filename, value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function renderEmissionsTeacherLibrary() {
  return {
    html: `<main class="teacher-platform emissions-library"><header class="teacher-platform__header"><div><p class="teacher-platform__eyebrow">LabInspeção · Emissões</p><h1>Bibliotecas e Calibração</h1><p>Gestão docente de veículos simulados, Casos Mestres, portabilidade e calibração didática.</p></div><a class="teacher-data-button" href="#/professor">Voltar</a></header><nav class="emissions-library__tabs"><button data-tab="vehicles">Veículos</button><button data-tab="cases">Casos</button><button data-tab="calibration">Calibração</button><button data-tab="audit">Auditoria</button></nav><section data-library-content></section></main>`,
    mount(routeRoot) {
      const page = routeRoot.querySelector('.emissions-library');
      const content = page.querySelector('[data-library-content]');
      const state = {
        vehicles: createInitialVehicleLibrary(),
        cases: [],
        calibrations: [structuredClone(DEFAULT_CALIBRATION_PROFILE)],
        audit: [],
      };
      let service = null;
      try {
        service = createEmissionsTeacherLibraryService();
      } catch {
        service = null;
      }

      async function refreshRemote() {
        if (!service) return;
        try {
          const [vehicles, cases, classes, calibrations, audit] = await Promise.all([
            service.listVehicles(),
            service.listCases(),
            service.listClasses(),
            service.listCalibrationProfiles(),
            service.listAudit(),
          ]);
          state.vehicles = vehicles.map((row) => ({ ...row.payload, archived: row.archived }));
          state.cases = cases.map((item) => {
            const versions = item.emissions_case_versions || [];
            const latest = [...versions].sort((a, b) => b.version - a.version)[0];
            return { ...item, payload: latest?.payload || null };
          });
          state.classes = classes;
          if (calibrations.length)
            state.calibrations = calibrations.map((row) => ({
              calibrationProfileId: row.calibration_profile_id,
              name: row.name,
              description: row.description,
              version: row.version,
              parameters: row.parameters,
              protectedDefault: row.protected_default,
            }));
          state.audit = audit;
        } catch {
          /* migration/sessão ainda não disponível: mantém dados locais */
        }
      }

      function vehiclesView() {
        content.innerHTML = `<h2>Biblioteca de Veículos</h2><p><strong>VEÍCULO SIMULADO</strong> — biblioteca didática; nenhuma consulta a bases reais.</p><div class="teacher-data-actions"><button data-add-vehicle>Novo</button><button data-import-vehicles>Importar CSV/XLSX</button><button data-export-vehicles>Exportar JSON</button><input hidden type="file" accept=".csv,.xlsx" data-vehicle-file></div><div>${state.vehicles.map((v) => `<article class="teacher-card"><strong>${esc(v.vehicleId)}</strong> · ${esc(v.manufacturer)} ${esc(v.model)} · ${esc(v.manufactureYear)}/${esc(v.modelYear)} · ${esc(v.fuel)} ${v.archived ? '· ARQUIVADO' : ''}<div><button data-edit-vehicle="${esc(v.vehicleId)}">Editar</button><button data-duplicate-vehicle="${esc(v.vehicleId)}">Duplicar</button><button data-archive-vehicle="${esc(v.vehicleId)}">${v.archived ? 'Restaurar' : 'Arquivar'}</button></div></article>`).join('')}</div><pre data-import-result></pre>`;
        const file = content.querySelector('[data-vehicle-file]');
        content.querySelector('[data-import-vehicles]').onclick = () => file.click();
        file.onchange = async () => {
          const rows = await parseTabularFile(file.files[0]);
          const result = importVehicleRows(state.vehicles, rows);
          state.vehicles.push(...result.imported);
          if (service) for (const vehicle of result.imported) await service.importVehicle(vehicle);
          vehiclesView();
          content.querySelector('[data-import-result]').textContent = JSON.stringify(
            result,
            null,
            2,
          );
        };
        content.querySelector('[data-export-vehicles]').onclick = () =>
          downloadJson('labinspecao-veiculos.json', exportVehicleLibrary(state.vehicles));
        content.querySelector('[data-add-vehicle]').onclick = () => {
          const id = `SIM-VEH-${Date.now()}`;
          state.vehicles.push({
            ...createInitialVehicleLibrary()[3],
            vehicleId: id,
            manufacturer: 'Fabricante Didático',
            model: 'Novo veículo',
            archived: false,
          });
          vehiclesView();
        };
        content.querySelectorAll('[data-edit-vehicle]').forEach((button) => {
          button.onclick = async () => {
            const vehicle = state.vehicles.find((v) => v.vehicleId === button.dataset.editVehicle);
            if (!vehicle) return;
            const nextModel = window.prompt('Modelo do veículo simulado', vehicle.model);
            if (nextModel === null) return;
            vehicle.model = nextModel.trim() || vehicle.model;
            if (service) await service.saveVehicle(vehicle);
            vehiclesView();
          };
        });
        content.querySelectorAll('[data-duplicate-vehicle]').forEach((button) => {
          button.onclick = () => {
            const source = state.vehicles.find(
              (v) => v.vehicleId === button.dataset.duplicateVehicle,
            );
            if (!source) return;
            state.vehicles.push({
              ...source,
              vehicleId: `${source.vehicleId}-COPY-${Date.now().toString().slice(-5)}`,
              archived: false,
            });
            vehiclesView();
          };
        });
        content.querySelectorAll('[data-archive-vehicle]').forEach((button) => {
          button.onclick = async () => {
            const vehicle = state.vehicles.find(
              (v) => v.vehicleId === button.dataset.archiveVehicle,
            );
            if (!vehicle) return;
            vehicle.archived = !vehicle.archived;
            if (service) await service.archiveVehicle(vehicle.vehicleId, vehicle.archived);
            vehiclesView();
          };
        });
      }

      function casesView() {
        const searchValue = content.querySelector('[data-case-search]')?.value || '';
        const filtered = state.cases.filter((item) =>
          `${item.case_id || item.caseId} ${item.title || item.payload?.title || ''}`
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
        );
        content.innerHTML = `<h2>Biblioteca de Casos</h2><p>Caso Mestre versionado; atividades aplicadas utilizam snapshot público imutável e gabarito privado.</p><div class="teacher-data-actions"><button data-new-case>Novo Caso</button><button data-import-cases>Importar CSV/XLSX</button><input data-case-search placeholder="Pesquisar caso" value="${esc(searchValue)}"><input hidden type="file" accept=".csv,.xlsx" data-case-file></div><pre data-case-result></pre>${
          filtered
            .map((item) => {
              const id = item.case_id || item.caseId;
              const version = item.current_version || item.version || item.payload?.version || 1;
              return `<article class="teacher-card"><strong>${esc(id)}</strong> · v${esc(version)} · ${esc(item.title || item.payload?.title || '')}<div><button data-duplicate-case="${esc(id)}">Duplicar</button><button data-version-case="${esc(id)}">Nova versão</button><button data-assign-case="${esc(id)}">Atribuir à turma</button><button data-export-case="${esc(id)}">Exportar pacote</button><button data-archive-case="${esc(id)}">Arquivar</button></div></article>`;
            })
            .join('') || '<p>Nenhum Caso Mestre cadastrado.</p>'
        }`;
        const file = content.querySelector('[data-case-file]');
        content.querySelector('[data-import-cases]').onclick = () => file.click();
        content.querySelector('[data-case-search]').oninput = (event) => {
          const value = event.target.value;
          casesView();
          const input = content.querySelector('[data-case-search]');
          input.value = value;
          input.focus();
        };
        content.querySelector('[data-new-case]').onclick = () => {
          const id = `CASE-${Date.now()}`;
          const record = {
            caseId: id,
            version: 1,
            title: 'Novo Caso Mestre',
            description: '',
            tags: [],
            objectives: [],
            difficulty: 'basic',
            vehicleId: state.vehicles[0]?.vehicleId || 'SIM-OTTO-FLEX-2022',
            ethanolContent: 27,
            faults: [{ id: 'misfire', severity: 'mild' }],
            remap: { injectionPct: 0, ignitionDeg: 0 },
            answerKey: {},
            expectedEvidence: [],
            status: 'draft',
          };
          state.cases.push(record);
          if (service) void service.importCase(record);
          casesView();
        };
        file.onchange = async () => {
          const rows = await parseTabularFile(file.files[0]);
          const existing = state.cases.map((item) => ({ caseId: item.case_id || item.caseId }));
          const result = importCaseRows(existing, rows);
          const preview = content.querySelector('[data-case-result]');
          preview.textContent = JSON.stringify(
            {
              stage: 'PREVIEW',
              rows: rows.length,
              valid: result.imported.length,
              ignored: result.ignored,
              errors: result.errors,
            },
            null,
            2,
          );
          if (!result.imported.length) return;
          const confirmButton = document.createElement('button');
          confirmButton.textContent = `Confirmar importação (${result.imported.length})`;
          preview.before(confirmButton);
          confirmButton.onclick = async () => {
            for (const record of result.imported) {
              state.cases.push(record);
              if (service) await service.importCase(record);
            }
            casesView();
          };
        };
        content.querySelectorAll('[data-export-case]').forEach((button) => {
          button.onclick = () => {
            const item = state.cases.find(
              (record) => (record.case_id || record.caseId) === button.dataset.exportCase,
            );
            const payload = item?.payload || item;
            if (payload?.caseId)
              downloadJson(`${payload.caseId}.json`, exportPortableCase(payload));
          };
        });
        content.querySelectorAll('[data-duplicate-case]').forEach((button) => {
          button.onclick = async () => {
            const item = state.cases.find(
              (record) => (record.case_id || record.caseId) === button.dataset.duplicateCase,
            );
            const source = structuredClone(item?.payload || item);
            if (!source?.caseId) return;
            source.caseId = `${source.caseId}-COPY-${Date.now().toString().slice(-5)}`;
            source.version = 1;
            source.title = `${source.title} — cópia`;
            state.cases.push(source);
            if (service) await service.importCase(source);
            casesView();
          };
        });
        content.querySelectorAll('[data-version-case]').forEach((button) => {
          button.onclick = async () => {
            const item = state.cases.find(
              (record) => (record.case_id || record.caseId) === button.dataset.versionCase,
            );
            const payload = structuredClone(item?.payload || item);
            const masterId = item?.id;
            if (!payload?.caseId || !masterId) return;
            payload.version = Number(item.current_version || payload.version || 1) + 1;
            if (service)
              await service.createCaseVersion(masterId, payload.caseId, payload.version, payload);
            item.current_version = payload.version;
            item.payload = payload;
            casesView();
          };
        });
        content.querySelectorAll('[data-archive-case]').forEach((button) => {
          button.onclick = async () => {
            const id = button.dataset.archiveCase;
            if (service) await service.archiveCase(id, true);
            const item = state.cases.find((record) => (record.case_id || record.caseId) === id);
            if (item) item.status = 'archived';
            casesView();
          };
        });
        content.querySelectorAll('[data-assign-case]').forEach((button) => {
          button.onclick = async () => {
            const item = state.cases.find(
              (record) => (record.case_id || record.caseId) === button.dataset.assignCase,
            );
            const payload = item?.payload || item;
            if (!service || !payload?.caseId) return;
            const choices = state.classes
              .map((c) => `${c.id} — ${c.name} ${c.term || ''}`)
              .join('\n');
            const classId = window.prompt(
              `Informe o UUID da turma:\n${choices}`,
              state.classes[0]?.id || '',
            );
            if (!classId) return;
            await service.assignCaseToClass(payload, classId, {
              publish: true,
              calibrationProfileId: state.calibrations[0]?.calibrationProfileId,
              calibrationVersion: state.calibrations[0]?.version || 1,
            });
            window.alert('Atividade aplicada criada por snapshot.');
          };
        });
      }

      function calibrationView() {
        const profile = structuredClone(state.calibrations[0] || DEFAULT_CALIBRATION_PROFILE);
        content.innerHTML = `<h2>Calibração do Modelo Didático</h2><p>Limites, artigos e fórmulas normativas permanecem protegidos.</p><label>Nome <input data-cal-name value="${esc(profile.name)}"></label><div class="emissions-calibration-grid">${Object.entries(
          CALIBRATION_PARAMETER_DEFINITIONS,
        )
          .map(
            ([key, def]) =>
              `<label>${esc(def.label)} <input type="number" min="${def.min}" max="${def.max}" step="${def.step}" data-cal-param="${key}" value="${profile.parameters[key]}"></label>`,
          )
          .join(
            '',
          )}</div><button data-reset-cal>Restaurar valores padrão</button><button data-save-cal>Salvar nova versão</button><pre data-cal-diff></pre>`;
        content.querySelector('[data-reset-cal]').onclick = () => {
          state.calibrations[0] = structuredClone(DEFAULT_CALIBRATION_PROFILE);
          calibrationView();
        };
        content.querySelector('[data-save-cal]').onclick = async () => {
          const next = structuredClone(profile);
          next.name = content.querySelector('[data-cal-name]').value;
          next.version += 1;
          content.querySelectorAll('[data-cal-param]').forEach((input) => {
            next.parameters[input.dataset.calParam] = Number(input.value);
          });
          const validation = validateCalibrationProfile(next);
          if (!validation.valid) {
            content.querySelector('[data-cal-diff]').textContent = validation.errors.join('\n');
            return;
          }
          const changes = diffCalibrationProfiles(profile, validation.value);
          content.querySelector('[data-cal-diff]').textContent = JSON.stringify(changes, null, 2);
          state.calibrations[0] = validation.value;
          if (service) await service.saveCalibrationProfile(validation.value, changes);
        };
      }
      function auditView() {
        content.innerHTML = `<h2>Histórico / Auditoria</h2>${state.audit.map((row) => `<article class="teacher-card"><strong>${esc(row.action)}</strong> · ${esc(row.entity_type)} ${esc(row.entity_id)} · ${esc(row.occurred_at)}</article>`).join('') || '<p>Sem eventos de auditoria disponíveis.</p>'}`;
      }
      function select(tab) {
        (
          ({
            vehicles: vehiclesView,
            cases: casesView,
            calibration: calibrationView,
            audit: auditView,
          })[tab] || vehiclesView
        )();
      }
      page.querySelectorAll('[data-tab]').forEach((button) => {
        button.onclick = () => select(button.dataset.tab);
      });
      void refreshRemote().finally(() => select('vehicles'));
    },
  };
}
