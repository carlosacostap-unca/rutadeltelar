export function highlightSpotBelongsToActor(
  relatedActorRecordIds: readonly string[] | undefined,
  actorRecordId: string | undefined,
) {
  if (!actorRecordId) {
    return false;
  }

  return relatedActorRecordIds?.includes(actorRecordId) ?? false;
}
