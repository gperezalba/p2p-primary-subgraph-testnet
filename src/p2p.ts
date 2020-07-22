import { BigInt } from "@graphprotocol/graph-ts"
import {
  PIBP2PPrimary,
  NewOffer,
  NewDeal,
  NewPendingDeal,
  UpdateOffer,
  CancelOffer,
  NewCommission,
  SetOfferer,
  SetAllowedOffer
} from "../generated/PIBP2PPrimary/PIBP2PPrimary"
import { Offer, User, P2P, Pair } from "../generated/schema"
import { pushOffer, pushPendingDeal, createUserIfNull } from "./user";
import { createDeal, finishDeal } from "./deal";
import { createOffer, updateOffer, cancelOffer } from "./offer";

export function handleNewOffer(event: NewOffer): void {
  createOffer(event);
  pushOffer(event.params.owner.toHexString(), event.params.offerId.toHexString());
}

export function handleNewDeal(event: NewDeal): void {
  finishDeal(event.params.dealId.toHexString(), event.params.success, event.params.sender);
}

export function handleNewPendingDeal(event: NewPendingDeal): void {
  createDeal(event);
  pushPendingDeal(event.params.buyer.toHexString(), event.params.dealId.toHexString());
  let offer = Offer.load(event.params.offerId.toHexString());

  if (offer != null) {
    pushPendingDeal(offer.owner, event.params.dealId.toHexString());
  }
}

export function handleUpdateOffer(event: UpdateOffer): void {
  updateOffer(event);
}

export function handleCancelOffer(event: CancelOffer): void {
  cancelOffer(event);
}

export function handleNewCommission(event: NewCommission): void {
  let p2p = P2P.load(event.address.toHexString());

  if (p2p == null) {
    p2p = new P2P(event.address.toHexString());
  }

  p2p.commission = event.params.commission;

  p2p.save();
}

export function handleSetOfferer(event: SetOfferer): void {
  createUserIfNull(event.params.offerer.toHexString());
  let user = User.load(event.params.offerer.toHexString());

  let allowedTokens = user.allowedTokens;

  if (event.params.isOfferer) {
    if (!allowedTokens.includes(event.params.token.toHexString())) {
      allowedTokens.push(event.params.token.toHexString());
      user.allowedTokens = allowedTokens;
    }
  } else {
    let index = allowedTokens.indexOf(event.params.token.toHexString());

    if (index > -1) {
      allowedTokens.splice(index, 1);
    }

    user.allowedTokens = allowedTokens;
  }

  user.save();
}

export function handleSetAllowedOffer(event: SetAllowedOffer): void {
  createPairIfNull(event.params.sellToken.toHexString(), event.params.buyToken.toHexString());
  let pairId = event.params.sellToken.toHexString().concat("-").concat(event.params.buyToken.toHexString());
  let pair = Pair.load(pairId);
  pair.isAllowed = event.params.isAllowed;
  pair.save();
}

function createPairIfNull(sellToken: string, buyToken: string): void {
  let pairId = sellToken.concat("-").concat(buyToken);
  let pair = Pair.load(pairId);

  if (pair == null) {
    pair = new Pair(pairId);
    pair.sellToken = sellToken;
    pair.buyToken = buyToken;
    pair.isAllowed = false;
    pair.save();
  }
}