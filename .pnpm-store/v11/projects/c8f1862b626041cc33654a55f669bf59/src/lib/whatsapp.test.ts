import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeRdcPhone,
  buildWhatsAppLink,
  buildClientToCyberWhatsAppLink,
  buildCyberToClientWhatsAppLink,
} from "./whatsapp";

describe("normalizeRdcPhone", () => {
  it("normalise 0812345678 en 243812345678", () => {
    assert.equal(normalizeRdcPhone("0812345678"), "243812345678");
  });

  it("normalise avec espaces 081 234 5678", () => {
    assert.equal(normalizeRdcPhone("081 234 5678"), "243812345678");
  });

  it("normalise avec tirets 081-234-5678", () => {
    assert.equal(normalizeRdcPhone("081-234-5678"), "243812345678");
  });

  it("normalise +243 812 345 678", () => {
    assert.equal(normalizeRdcPhone("+243 812 345 678"), "243812345678");
  });

  it("normalise 243812345678 déjà complet", () => {
    assert.equal(normalizeRdcPhone("243812345678"), "243812345678");
  });

  it("normalise 00243812345678", () => {
    assert.equal(normalizeRdcPhone("00243812345678"), "243812345678");
  });

  it("normalise 9 chiffres bruts sans le 0", () => {
    assert.equal(normalizeRdcPhone("812345678"), "243812345678");
  });

  it("rejette un numéro trop court", () => {
    assert.equal(normalizeRdcPhone("081234"), null);
  });

  it("rejette un numéro vide ou texte", () => {
    assert.equal(normalizeRdcPhone("invalide"), null);
    assert.equal(normalizeRdcPhone(""), null);
  });
});

describe("buildWhatsAppLink", () => {
  it("génère une URL wa.me valide", () => {
    const url = buildWhatsAppLink("0812345678", "Bonjour");
    assert.equal(url, "https://wa.me/243812345678?text=Bonjour");
  });

  it("génère gabarit client vers cyber", () => {
    const url = buildClientToCyberWhatsAppLink("CED-0042", "Formation Excel");
    assert.ok(url.includes("https://wa.me/"));
    assert.ok(url.includes(encodeURIComponent("Bonjour Cyber Cedest, ma demande CED-0042 : Formation Excel.")));
  });

  it("génère gabarit cyber vers client", () => {
    const url = buildCyberToClientWhatsAppLink(
      "0812345678",
      "Jean",
      "CED-0042",
      "Installation Wi-Fi"
    );
    assert.equal(
      url,
      `https://wa.me/243812345678?text=${encodeURIComponent(
        "Bonjour Jean, ici Cyber Cedest. Nous avons bien reçu votre demande CED-0042 (Installation Wi-Fi)."
      )}`
    );
  });
});
