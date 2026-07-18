import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { experienceBelongsToActor } from "../../app/lib/actor-experiences.ts";

describe("actor experience relations", () => {
  it("includes experiences assigned through the actor record", () => {
    assert.equal(
      experienceBelongsToActor(
        { responsibleRecordId: "actor-a" },
        { recordId: "actor-a", slug: "actor-a" },
      ),
      true,
    );
  });

  it("uses the responsible slug when the record relation is unavailable", () => {
    assert.equal(
      experienceBelongsToActor(
        { responsibleSlug: "actor-a" },
        { slug: "actor-a" },
      ),
      true,
    );
  });

  it("excludes experiences assigned to another actor or only sharing territory", () => {
    assert.equal(
      experienceBelongsToActor(
        { responsibleRecordId: "actor-b", responsibleSlug: "actor-b" },
        { recordId: "actor-a", slug: "actor-a" },
      ),
      false,
    );
    assert.equal(experienceBelongsToActor({}, { recordId: "actor-a" }), false);
  });
});
