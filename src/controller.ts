import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts"
import {
  Controller as ControllerContract,
  NewToken,
  NewNFToken
} from "../generated/Controller/Controller"
import { createToken } from "./token";

export function handleNewToken(event: NewToken): void {
  createToken(event.params.newToken, false, BigInt.fromI32(0));
}

export function handleNewNFToken(event: NewNFToken): void {
  createToken(event.params.newToken, true, event.params.category);
}
