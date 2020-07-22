import { NewOffer, NewDeal, UpdateOffer, CancelOffer, NewCommission, SetAllowedOffer, SetOfferer } from "../generated/PIBP2PCommodityPrimary/PIBP2PCommodityPrimary";
import { createOfferCommodity, updateOfferCommodity, cancelOfferCommodity } from "./offer";
import { pushCommodityOffer, pushCommodityDeal, createUserIfNull } from "./user";
import { createCommodityDeal } from "./deal";
import { OfferCommodity, Commodity, P2PCommodity, Pair, User } from "../generated/schema";
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