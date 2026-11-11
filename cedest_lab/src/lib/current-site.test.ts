import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveCurrentSite, NONE_CURRENT_SITE } from "./current-site-resolve";
import { getKinshasaDateIso } from "./time";

const sites = [
  { id: "kimiala", nom: "KIMIALA", actif: true },
  { id: "shell", nom: "SHELL", actif: true },
];

const shellShift = { siteId: "shell", siteNom: "SHELL", siteActif: true };

describe("resolveCurrentSite", () => {
  it("force le site du poste même avec un cookie KIMIALA (opérateur)", () => {
    const result = resolveCurrentSite({
      role: "operateur",
      rawSiteCookie: "kimiala",
      userSites: sites,
      todayShift: shellShift,
    });

    assert.equal(result.id, "shell");
    assert.equal(result.nom, "SHELL");
    assert.equal(result.isAll, false);
    assert.equal(result.reason, undefined);
  });

  it("force le site du poste même avec un cookie « Tous les sites » (opérateur)", () => {
    const result = resolveCurrentSite({
      role: "operateur",
      rawSiteCookie: "ALL",
      userSites: sites,
      todayShift: shellShift,
    });

    assert.equal(result.id, "shell");
    assert.equal(result.isAll, false);
  });

  it("renvoie aucun poste pour un opérateur sans poste aujourd'hui", () => {
    const result = resolveCurrentSite({
      role: "technicien",
      rawSiteCookie: "shell",
      userSites: sites,
      todayShift: null,
    });

    assert.deepEqual(result, NONE_CURRENT_SITE);
    assert.equal(result.id, null);
    assert.equal(result.reason, "aucun_poste");
  });

  it("renvoie site_indisponible si le site du poste est inactif (opérateur)", () => {
    const result = resolveCurrentSite({
      role: "technicien",
      rawSiteCookie: undefined,
      userSites: sites,
      todayShift: { ...shellShift, siteActif: false },
    });

    assert.equal(result.id, null);
    assert.equal(result.isAll, false);
    assert.equal(result.reason, "site_indisponible");
  });

  it("respecte le cookie du gérant", () => {
    const shell = resolveCurrentSite({
      role: "gerant",
      rawSiteCookie: "shell",
      userSites: sites,
      todayShift: null,
    });

    assert.equal(shell.id, "shell");
    assert.equal(shell.isAll, false);

    const kimiala = resolveCurrentSite({
      role: "gerant",
      rawSiteCookie: "kimiala",
      userSites: sites,
      todayShift: null,
    });

    assert.equal(kimiala.id, "kimiala");
    assert.equal(kimiala.isAll, false);
  });

  it("renvoie « Tous les sites » pour le gérant sans cookie valide", () => {
    const withoutCookie = resolveCurrentSite({
      role: "gerant",
      rawSiteCookie: undefined,
      userSites: sites,
      todayShift: null,
    });

    assert.equal(withoutCookie.isAll, true);
    assert.equal(withoutCookie.id, null);

    const all = resolveCurrentSite({
      role: "gerant",
      rawSiteCookie: "ALL",
      userSites: sites,
      todayShift: null,
    });

    assert.equal(all.isAll, true);
  });

  it("ignore un cookie falsifié (gérant)", () => {
    const result = resolveCurrentSite({
      role: "gerant",
      rawSiteCookie: "site-qui-nexiste-pas",
      userSites: sites,
      todayShift: null,
    });

    assert.equal(result.isAll, true);
    assert.equal(result.id, null);
  });

  it("ignore un cookie pointant vers un site désactivé (gérant)", () => {
    const result = resolveCurrentSite({
      role: "gerant",
      rawSiteCookie: "shell",
      userSites: [
        { id: "shell", nom: "SHELL", actif: false },
        { id: "kimiala", nom: "KIMIALA", actif: true },
      ],
      todayShift: null,
    });

    assert.equal(result.isAll, true);
    assert.equal(result.id, null);
  });
});

describe("getKinshasaDateIso (passage de minuit)", () => {
  it("à 23h30 UTC, l'heure locale de Kinshasa est déjà le lendemain", () => {
    // 2026-11-11T23:30:00Z = 2026-11-12T00:30:00 à Kinshasa (UTC+1).
    assert.equal(
      getKinshasaDateIso(new Date("2026-11-11T23:30:00.000Z")),
      "2026-11-12"
    );
  });

  it("à 22h30 UTC, l'heure locale de Kinshasa est encore le jour même", () => {
    assert.equal(
      getKinshasaDateIso(new Date("2026-11-11T22:30:00.000Z")),
      "2026-11-11"
    );
  });
});
