import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { productBelongsToActor } from "../../app/lib/actor-products.ts";

describe("actor product relations", () => {
  it("includes products explicitly related to the actor", () => {
    assert.equal(productBelongsToActor(["actor-a", "actor-b"], "actor-a"), true);
  });

  it("excludes products related to other actors", () => {
    assert.equal(productBelongsToActor(["actor-b"], "actor-a"), false);
  });

  it("excludes products without an explicit actor relation", () => {
    assert.equal(productBelongsToActor(undefined, "actor-a"), false);
    assert.equal(productBelongsToActor(["actor-a"], undefined), false);
  });
});
