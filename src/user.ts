import { User, Reputation } from "../generated/schema";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { PIBP2PPrimary } from "../generated/PIBP2PPrimary/PIBP2PPrimary";
import { NameService, CreateName } from "../generated/NameService/NameService";

export function handleCreateName(event: CreateName): void {
    createUserIfNull(event.params.wallet.toHexString());
}

export function pushOffer(userId: string, offerId: string): void {
    createUserIfNull(userId);
    let user = User.load(userId);

    let offers = user.offers;
    offers.push(offerId);
    user.offers = offers;

    user.save();
}

export function pushCommodityOffer(userId: string, offerId: string): void {
    createUserIfNull(userId);
    let user = User.load(userId);

    let offers = user.commodityOffers;
    offers.push(offerId);
    user.commodityOffers = offers;

    user.save();
}

export function pushPackableOffer(userId: string, offerId: string): void {
    createUserIfNull(userId);
    let user = User.load(userId);

    let offers = user.packableOffers;
    offers.push(offerId);
    user.packableOffers = offers;

    user.save();
}

export function pushPendingDeal(userId: string, dealId: string): void {
    createUserIfNull(userId);
    let user = User.load(userId);

    let deals = user.deals;
    deals.push(dealId);
    user.deals = deals;

    user.save();
}

export function pushCommodityDeal(userId: string, dealId: string): void {
    createUserIfNull(userId);
    let user = User.load(userId);

    let deals = user.commodityDeals;
    deals.push(dealId);
    user.commodityDeals = deals;

    user.save();
}

export function pushPackableDeal(userId: string, dealId: string): void {
    createUserIfNull(userId);
    let user = User.load(userId);

    let deals = user.packableDeals;
    deals.push(dealId);
    user.packableDeals = deals;

    user.save();
}

export function createUserIfNull(userId: string): void {
    let user = User.load(userId);

    if (user == null) {
        user = new User(userId);
        user.offers = [];
        user.commodityOffers = [];
        user.packableOffers = [];
        user.deals = [];
        user.commodityDeals = [];
        user.packableDeals = [];
        user.reputations = [];
        user.allowedTokens = [];
        user.name = getNickname(userId);
        user.offchainReputation = BigInt.fromI32(0);
        user.isDealLocked = false;

        user.save();
    }
}

export function getNickname(walletAddress: string): string {
    let nameService = NameService.bind(Address.fromString("0x672af58B94683cBcd2De173c5940d49Deb4cF5E6"));
    let name = nameService.try_name(Address.fromString(walletAddress));

    if (!name.reverted) {
        return name.value;
    } else {
        return "reverted";
    }
}