// backend/graphql/src/mapping.ts
import { ModelRegistered, ModelVerified } from "../generated/Marketplace/Marketplace"
import { Model, Reputation } from "../generated/schema"

export function handleModelRegistered(event: ModelRegistered): void {
  let model = new Model(event.params.modelHash.toHex())
  model.owner = event.params.owner
  model.timestamp = event.block.timestamp
  model.isVerified = false
  model.verificationCount = 0
  model.price = event.params.price
  model.uri = event.params.uri
  model.save()
}

export function handleModelVerified(event: ModelVerified): void {
  let model = Model.load(event.params.modelHash.toHex())
  if (model) {
    model.isVerified = true
    model.verificationCount += 1
    model.save()
  }
}