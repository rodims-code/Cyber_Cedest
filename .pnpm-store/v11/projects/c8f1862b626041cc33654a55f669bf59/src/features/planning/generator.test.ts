import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MIN_PAR_SITE,
  generatePlanning,
  type GeneratedShift,
  type PlanningOperator,
  type PlanningSite,
} from "./generator";

const sites: PlanningSite[] = [
  { id: "site-kimiala", nom: "KIMIALA" },
  { id: "site-shell", nom: "SHELL" },
];

const days = [
  "2026-11-09",
  "2026-11-10",
  "2026-11-11",
  "2026-11-12",
  "2026-11-13",
  "2026-11-14",
];

function makeOperators(count: number): PlanningOperator[] {
  return Array.from({ length: count }, (_value, index) => ({
    id: `u${index + 1}`,
    nom: `Opérateur ${index + 1}`,
  }));
}

function shiftsForDay(shifts: GeneratedShift[], date: string): GeneratedShift[] {
  return shifts.filter((shift) => shift.date === date);
}

function countBySite(shifts: GeneratedShift[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const shift of shifts) {
    counts.set(shift.siteId, (counts.get(shift.siteId) ?? 0) + 1);
  }
  return counts;
}

function countByUserSite(
  shifts: GeneratedShift[]
): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>();
  for (const shift of shifts) {
    const perSite = counts.get(shift.userId) ?? new Map<string, number>();
    perSite.set(shift.siteId, (perSite.get(shift.siteId) ?? 0) + 1);
    counts.set(shift.userId, perSite);
  }
  return counts;
}

describe("generatePlanning", () => {
  it("couvre chaque jour avec 1 opérateur et 1 site", () => {
    const operators = makeOperators(1);
    const result = generatePlanning({
      operators,
      sites: [sites[0]],
      days,
    });

    assert.equal(result.complete, true);
    assert.equal(result.warnings.length, 0);
    assert.equal(result.shifts.length, days.length);

    for (const shift of result.shifts) {
      assert.equal(shift.userId, operators[0].id);
      assert.equal(shift.siteId, sites[0].id);
      assert.equal(shift.fonction, "operateur");
    }
  });

  it("avertit sans générer quand 1 opérateur ne peut pas couvrir 2 sites", () => {
    const result = generatePlanning({
      operators: makeOperators(1),
      sites,
      days,
    });

    assert.equal(result.complete, false);
    assert.equal(result.shifts.length, 0);
    assert.equal(result.warnings.length, days.length);

    for (const [index, warning] of result.warnings.entries()) {
      assert.equal(warning.date, days[index]);
      assert.equal(warning.code, "insufficient_staff");
      assert.equal(warning.available, 1);
      assert.equal(warning.required, 2);
    }
  });

  for (const operatorCount of [2, 3, 4, 5, 6]) {
    it(`répartit équitablement avec ${operatorCount} opérateurs et 2 sites`, () => {
      const operators = makeOperators(operatorCount);
      const result = generatePlanning({ operators, sites, days });

      assert.equal(result.complete, true);
      assert.equal(result.shifts.length, operatorCount * days.length);

      for (const date of days) {
        const dayShifts = shiftsForDay(result.shifts, date);
        assert.equal(dayShifts.length, operatorCount);
        assert.equal(
          new Set(dayShifts.map((shift) => shift.userId)).size,
          operatorCount,
          "un seul poste par opérateur et par jour"
        );

        const counts = countBySite(dayShifts);
        const perSite = sites.map((site) => counts.get(site.id) ?? 0);
        assert.equal(
          perSite.reduce((total, count) => total + count, 0),
          operatorCount
        );
        assert.ok(Math.min(...perSite) >= MIN_PAR_SITE);
        assert.ok(
          Math.max(...perSite) - Math.min(...perSite) <= 1,
          `répartition non équilibrée le ${date}: ${perSite.join("/")}`
        );
      }

      // Sur la semaine, chaque opérateur passe autant de temps sur chaque site.
      const perUserSite = countByUserSite(result.shifts);
      for (const operator of operators) {
        const perSite = sites.map(
          (site) => perUserSite.get(operator.id)?.get(site.id) ?? 0
        );
        assert.equal(
          perSite.reduce((total, count) => total + count, 0),
          days.length
        );
        assert.ok(
          Math.abs(perSite[0] - perSite[1]) <= 1,
          `rotation non équilibrée pour ${operator.id}: ${perSite.join("/")}`
        );
      }
    });
  }

  for (const operatorCount of [3, 5]) {
    it(`fait alterner le site en surnombre avec ${operatorCount} opérateurs`, () => {
      const result = generatePlanning({
        operators: makeOperators(operatorCount),
        sites,
        days,
      });

      const extraSiteByDay = days.map((date) => {
        const counts = countBySite(shiftsForDay(result.shifts, date));
        return (counts.get(sites[0].id) ?? 0) >
          (counts.get(sites[1].id) ?? 0)
          ? sites[0].id
          : sites[1].id;
      });

      assert.deepEqual(extraSiteByDay, [
        sites[0].id,
        sites[1].id,
        sites[0].id,
        sites[1].id,
        sites[0].id,
        sites[1].id,
      ]);
    });
  }

  it("respecte les jours de repos avec 3 opérateurs", () => {
    const operators = makeOperators(3);
    const restDays = {
      u1: [days[0]],
      u2: [days[1]],
    };

    const result = generatePlanning({
      operators,
      sites,
      days,
      restDays,
    });

    assert.equal(result.complete, true);
    assert.equal(result.shifts.length, 3 * days.length - 2);
    assert.equal(
      result.shifts.filter(
        (shift) => shift.date === days[0] && shift.userId === "u1"
      ).length,
      0
    );
    assert.equal(
      result.shifts.filter(
        (shift) => shift.date === days[1] && shift.userId === "u2"
      ).length,
      0
    );

    for (const date of days) {
      const counts = countBySite(shiftsForDay(result.shifts, date));
      assert.ok((counts.get(sites[0].id) ?? 0) >= 1);
      assert.ok((counts.get(sites[1].id) ?? 0) >= 1);
    }
  });

  it("avertit quand un jour de repos rend l'effectif insuffisant", () => {
    const result = generatePlanning({
      operators: makeOperators(2),
      sites,
      days,
      restDays: { u1: [days[0]] },
    });

    assert.equal(result.complete, false);
    assert.equal(result.warnings.length, 1);
    assert.equal(result.warnings[0].date, days[0]);
    assert.equal(result.warnings[0].code, "insufficient_staff");
    assert.equal(result.shifts.length, 2 * (days.length - 1));
    assert.equal(shiftsForDay(result.shifts, days[0]).length, 0);

    for (const date of days.slice(1)) {
      const counts = countBySite(shiftsForDay(result.shifts, date));
      assert.equal(counts.get(sites[0].id), 1);
      assert.equal(counts.get(sites[1].id), 1);
    }
  });

  it("tient compte de la semaine précédente pour la rotation", () => {
    const operators = makeOperators(2);
    const previousWeek = [
      ...days.map((date) => ({
        date,
        siteId: sites[0].id,
        userId: "u1",
      })),
      ...days.map((date) => ({
        date,
        siteId: sites[1].id,
        userId: "u2",
      })),
    ];

    const result = generatePlanning({
      operators,
      sites,
      days,
      previousWeek,
    });

    assert.equal(result.complete, true);

    const firstDay = shiftsForDay(result.shifts, days[0]);
    assert.equal(
      firstDay.find((shift) => shift.userId === "u1")?.siteId,
      sites[1].id
    );
    assert.equal(
      firstDay.find((shift) => shift.userId === "u2")?.siteId,
      sites[0].id
    );

    const perUserSite = countByUserSite(result.shifts);
    for (const operator of operators) {
      assert.deepEqual(
        sites.map((site) => perUserSite.get(operator.id)?.get(site.id) ?? 0),
        [3, 3]
      );
    }
  });

  it("respecte un minimum de 2 opérateurs par site", () => {
    const result = generatePlanning({
      operators: makeOperators(4),
      sites,
      days,
      minPerSite: 2,
    });

    assert.equal(result.complete, true);
    for (const date of days) {
      const counts = countBySite(shiftsForDay(result.shifts, date));
      assert.equal(counts.get(sites[0].id), 2);
      assert.equal(counts.get(sites[1].id), 2);
    }
  });

  it("avertit quand il n'y a aucun site ou aucun opérateur", () => {
    const withoutSites = generatePlanning({
      operators: makeOperators(2),
      sites: [],
      days,
    });
    assert.equal(withoutSites.complete, false);
    assert.equal(withoutSites.warnings[0].code, "no_sites");

    const withoutOperators = generatePlanning({
      operators: [],
      sites,
      days,
    });
    assert.equal(withoutOperators.complete, false);
    assert.equal(withoutOperators.warnings[0].code, "no_operators");
  });
});
