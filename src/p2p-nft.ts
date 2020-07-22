import { NewOffer, NewDeal, UpdateOffer, CancelOffer, NewCommission } from "../generated/PIBP2PCommodity/PIBP2PCommodity";
import { createOfferCommodity, updateOfferCommodity, cancelOfferCommodity } from "./offer";
import { pushCommodityOffer, pushCommodityDeal } from "./user";
import { createCommodityDeal } from "./deal";
import { OfferCommodity, Commodity, P2PCommodity } from "../generated/schema";
import { popP2P } from "./commodity";
import { BigInt } from "@graphprotocol/graph-ts";


export function handleNewOffer(event: NewOffer): void {
    createOfferCommodity(event);
    pushCommodityOffer(event.params.owner.toHexString(), event.params.offerId.toHexString());
}

export function handleNewDeal(event: NewDeal): void {
    createCommodityDeal(event);
    let offer = OfferCommodity.load(event.params.offerId.toHexString());
    if (offer != null) {
        pushCommodityDeal(offer.owner, event.params.offerId.toHexString());
    }
    
    pushCommodityDeal(event.params.buyer.toHexString(), event.params.offerId.toHexString());
    let commodity = Commodity.load(offer.sellId)
    popP2P(offer.sellToken, commodity.tokenId as BigInt);
}

export function handleUpdateOffer(event: UpdateOffer): void {
    updateOfferCommodity(event);
}

export function handleCancelOffer(event: CancelOffer): void {
    cancelOfferCommodity(event);
}

export function handleNewCommission(event: NewCommission): void {
    let p2p = P2PCommodity.load(event.address.toHexString());
  
    if (p2p == null) {
      p2p = new P2PCommodity(event.address.toHexString());
    }
  
    p2p.commission = event.params.commission;
  
    p2p.save();
  }