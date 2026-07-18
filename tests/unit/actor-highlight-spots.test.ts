import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { highlightSpotBelongsToActor } from "../../app/lib/actor-highlight-spots.ts";

describe("actor highlight spot relations", () => {
  it("includes highlight spots explicitly related to the actor", () => {
    assert.equal(
      highlightSpotBelongsToActor(["actor-a", "actor-b"], "actor-a"),
      true,
    );
  });

  it("excludes highlight spots related to other actors", () => {
    assert.equal(
      highlightSpotBelongsToActor(["actor-b"], "actor-a"),
      false,
    );
  });

  it("excludes highlight spots without an explicit actor relation", () => {
    assert.equal(highlightSpotBelongsToActor(undefined, "actor-a"), false);
    assert.equal(highlightSpotBelongsToActor(["actor-a"], undefined), false);
  });
});
