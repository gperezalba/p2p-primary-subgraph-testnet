import { NewOffer, NewDeal, UpdateOffer, CancelOffer, NewCommission } from "../generated/PIBP2PPackable/PIBP2PPackable";
import { P2PPackable, OfferPackable } from "../generated/schema";
import { cancelOfferPackable, updateOfferPackable, createOfferPackable } from "./offer";
import { pushPackableOffer, pushPackableDeal } from "./user";
import { createPackableDeal } from "./deal";


export function handleNewOffer(event: NewOffer): void {
    createOfferPackable(event);
    pushPackableOffer(event.params.owner.toHexString(), event.params.offerId.toHexString());
}

export function handleNewDeal(event: NewDeal): void {
    createPackableDeal(event);
    let offer = OfferPackable.load(event.params.offerId.toHexString());
    if (offer != null) {
        pushPackableDeal(offer.owner, event.params.offerId.toHexString());
    }
    
    pushPackableDeal(event.params.buyer.toHexString(), event.params.offerId.toHexString());

}

export function handleUpdateOffer(event: UpdateOffer): void {
    updateOfferPackable(event);
}

export function handleCancelOffer(event: CancelOffer): void {
    cancelOfferPackable(event);
}

export function handleNewCommission(event: NewCommission): void {
    let p2p = P2PPackable.load(event.address.toHexString());
  
    if (p2p == null) {
      p2p = new P2PPackable(event.address.toHexString());
    }
  
    p2p.commission = event.params.commission;
  
    p2p.save();
  }