import { describe, expect, it } from "vitest";
import { mapCandidateDetailToRecord } from "./candidate-detail-api";

describe("candidate detail API adapter", () => {
  it("maps an API candidate into the detail hub record without fixture fallback data", () => {
    const record = mapCandidateDetailToRecord(
      {
        id: 280,
        uuid: "b27ed59f-66d8-49ec-b507-958c830cff1d",
        fullName: "KAUE DOS SANTOS",
        email: "kaue@example.test",
        phone: "+353 555 123",
        sourceName: "Indeed",
        status: "accepted",
        hiringFlowStep: { id: 13, uuid: "step-uuid", name: "Shortlisted", group: "current" },
        location: { cityFullName: "Dublin, Ireland" },
        file: { url: "https://cdn.example.test/cv.pdf", previews: ["https://cdn.example.test/cv.png"] },
        tags: [{ name: "api-seed" }],
        job: { id: 12, uuid: "job-uuid", title: "Product Designer" },
        forms: [{ uuid: "form-1", title: "Screen", answeredAt: "2026-04-22" }],
        documents: [{ uuid: "doc-1", title: "Portfolio", fileName: "portfolio.pdf", url: "https://cdn.example.test/portfolio.pdf" }],
        interviewForms: [{ code: "int-1", score: 4 }],
        totalScore: 82,
        updatedAt: "2026-04-22T10:00:00Z",
      },
      [{ message: "API note" }],
    );

    expect(record).toMatchObject({
      id: "b27ed59f-66d8-49ec-b507-958c830cff1d",
      cvId: "280",
      name: "KAUE DOS SANTOS",
      stage: "Shortlisted",
      email: "kaue@example.test",
      location: "Dublin, Ireland",
      comments: ["API note"],
      tags: ["api-seed"],
      formsCount: 1,
      candidateOwnedDocuments: 1,
      interviewsCount: 1,
      previewPath: "https://cdn.example.test/cv.png",
      downloadPath: "https://cdn.example.test/cv.pdf",
    });
    expect(record.name).not.toContain("Candidate b27ed59f");
  });
});
