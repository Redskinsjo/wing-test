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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTrackingIdToParcel = void 0;
const axios_1 = __importDefault(require("axios"));
const createParcels_1 = require("./createParcels");
const generateTrackingId = () => __awaiter(void 0, void 0, void 0, function* () {
    const id = yield axios_1.default.get("https://random.justyy.workers.dev/api/random/?cached&n=15");
    return id.data;
});
const setTrackingIdToParcel = (parcels) => {
    const readyToShipParcels = Promise.all(parcels.map((parcel) => __awaiter(void 0, void 0, void 0, function* () {
        return (Object.assign(Object.assign({}, parcel), { tracking_id: yield generateTrackingId() }));
    })));
    return readyToShipParcels;
};
exports.setTrackingIdToParcel = setTrackingIdToParcel;
const calculateRevenue = (weight) => {
    if (weight <= 1)
        return 1;
    if (weight <= 5 && weight > 1)
        return 2;
    if (weight <= 10 && weight > 5)
        return 3;
    if (weight <= 20 && weight > 10)
        return 5;
    return 10;
};
(0, createParcels_1.createParcels)()
    .then((parcels) => {
    (0, exports.setTrackingIdToParcel)(parcels)
        .then((readyToShipParcels) => {
        const totalGain = readyToShipParcels.reduce((acc, curr) => {
            const gain = calculateRevenue(curr.weight);
            return acc + gain;
        }, 0);
        console.log("Revenue made from orders : ", totalGain);
    })
        .catch((err) => {
        console.log(err);
    });
})
    .catch((err) => {
    console.log(err);
});
