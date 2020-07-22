import { NewOffer, NewDeal, UpdateOffer, CancelOffer, NewCommission, SetOfferer, SetAllowedOffer } from "../generated/PIBP2PPackablePrimary/PIBP2PPackablePrimary";
import { P2PPackable, OfferPackable, Pair, User } from "../generated/schema";
import { cancelOfferPackable, updateOfferPackable, createOfferPackable } from "./offer";
import { pushPackableOffer, pushPackableDeal, createUserIfNull } from "./user";
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