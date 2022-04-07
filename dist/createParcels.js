"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParcels = void 0;
const fs_1 = require("fs");
const parseFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const fileData = yield fs_1.promises.readFile(path, "utf-8");
    return JSON.parse(fileData);
});
const createParcels = () => __awaiter(void 0, void 0, void 0, function* () {
    // with node, json files can be parsed to use data
    const { items } = (yield parseFile("./src/data/items.json"));
    const { orders } = (yield parseFile("./src/data/orders.json"));
    let parcels = [];
    let sides = [];
    // items are set to accepted until the 30kg are reached
    for (let i = 0; i < orders.length; i++) {
        const orderItems = orders[i].items.reduce((acc, curr) => {
            const item = items.find((item) => item.id === curr.item_id);
            if (item) {
                const weight = Number(item.weight) * curr.quantity;
                if (acc.weight + weight <= 30) {
                    acc.weight += weight;
                    acc.accepted.push(curr);
                    console.log("An item was added to a parcel : ", curr.item_id);
                }
                else {
                    acc.rejected.push(curr);
                }
            }
            else {
                console.error("An order item was not found into the stock :", curr.item_id);
            }
            return acc;
        }, { weight: 0, accepted: [], rejected: [] });
        const newParcel = {
            order_id: orders[i].id,
            items: orderItems.accepted,
            weight: orderItems.weight,
            palette_number: Math.ceil(parcels.length / 14),
        };
        parcels.push(newParcel);
        sides.concat(orderItems.rejected);
    }
    // the rejected items are then added one by one to the parcel that are not full
    sides.forEach((orderItem, index) => {
        const item = items.find((item) => item.id === orderItem.item_id);
        if (item) {
            const weight = Number(item.weight) * orderItem.quantity;
            const parcel = parcels.find((parcel) => parcel.weight + weight <= 30);
            if (parcel) {
                parcel.items.push(orderItem);
                console.log("An item was added to a parcel : ", orderItem.item_id);
                sides.splice(index, 1);
            }
            else {
                console.error("A parcel was not found for this orderItem", orderItem.item_id);
            }
        }
        else {
            console.error("An order item was not found into the stock :", orderItem.item_id);
        }
    });
    return parcels;
});
exports.createParcels = createParcels;
