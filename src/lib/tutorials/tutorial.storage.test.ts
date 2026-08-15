import { beforeEach, describe, expect, it } from "vitest";
import {
  getTutorialStorage,
  hasSeenTutorialInvite,
  isTaskCompleted,
  isTutorialCompleted,
  markTaskCompleted,
  markTutorialCompleted,
  markTutorialInviteSeen,
} from "./tutorial.storage";

const KEY = "multiclinica:tutorials:v1";

beforeEach(() => {
  window.localStorage.clear();
});

describe("tutorial.storage", () => {
  it("storage vazio retorna estado padrão", () => {
    expect(getTutorialStorage()).toEqual({ modules: {}, invitesSeen: {}, tasks: {} });
  });

  it("completed é false quando módulo nunca foi concluído", () => {
    expect(isTutorialCompleted("agenda")).toBe(false);
  });

  it("completed é true após markTutorialCompleted", () => {
    markTutorialCompleted("agenda");
    expect(isTutorialCompleted("agenda")).toBe(true);
  });

  it("convite ainda não exibido retorna false", () => {
    expect(hasSeenTutorialInvite("agenda")).toBe(false);
  });

  it("convite já exibido retorna true após markTutorialInviteSeen", () => {
    markTutorialInviteSeen("agenda");
    expect(hasSeenTutorialInvite("agenda")).toBe(true);
  });

  it("recusar convite não marca completed", () => {
    markTutorialInviteSeen("agenda");
    expect(hasSeenTutorialInvite("agenda")).toBe(true);
    expect(isTutorialCompleted("agenda")).toBe(false);
  });

  it("JSON corrompido não derruba a aplicação e retorna estado padrão", () => {
    window.localStorage.setItem(KEY, "{not-valid-json");
    expect(getTutorialStorage()).toEqual({ modules: {}, invitesSeen: {}, tasks: {} });
  });

  it("versão/formato desconhecido no storage retorna estado padrão", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ unexpected: "shape" }));
    expect(getTutorialStorage()).toEqual({ modules: {}, invitesSeen: {}, tasks: {} });
  });

  it("task completed é false quando nunca foi concluída", () => {
    expect(isTaskCompleted("patients", "create-patient")).toBe(false);
  });

  it("task completed é true após markTaskCompleted", () => {
    markTaskCompleted("patients", "create-patient");
    expect(isTaskCompleted("patients", "create-patient")).toBe(true);
  });

  it("tasks de módulos diferentes não colidem", () => {
    markTaskCompleted("patients", "create-patient");
    expect(isTaskCompleted("agenda", "create-patient")).toBe(false);
    expect(isTaskCompleted("patients", "create-appointment")).toBe(false);
  });

  it("storage antigo sem o campo tasks (versão anterior) não quebra e trata como vazio", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ modules: { agenda: { completed: true } }, invitesSeen: {} }),
    );
    expect(getTutorialStorage()).toEqual({
      modules: { agenda: { completed: true } },
      invitesSeen: {},
      tasks: {},
    });
    expect(isTaskCompleted("patients", "create-patient")).toBe(false);
  });
});
