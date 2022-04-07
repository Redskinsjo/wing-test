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
const createParcels_1 = require("./createParcels");
const index_1 = require("./index");
describe("Create parcels", () => {
    let readyToShipParcels;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // skip console.info logs
        console.info = () => { };
        const parcels = yield (0, createParcels_1.createParcels)();
        readyToShipParcels = yield (0, index_1.setTrackingIdToParcel)(parcels);
    }));
    it("tracking_id must be unique", () => {
        const totalUniqueIds = new Set(readyToShipParcels.map((p) => p.tracking_id))
            .size;
        expect(totalUniqueIds).toBe(readyToShipParcels.length);
    });
    it("should have max 15 parcels per palette", () => {
        const hash = {};
        readyToShipParcels.forEach((parcel) => {
            const num = parcel.palette_number;
            if (hash[num]) {
                hash[num]++;
            }
            else {
                hash[num] = 1;
            }
        });
        const values = Object.values(hash);
        // delete last element for hash values because last palette can be not completely filled
        delete values[values.length - 1];
        expect(values.every((num) => num <= 15)).toBe(true);
    });
    it("weight must be less than 30kg", () => {
        const weights = readyToShipParcels.map((parcel) => parcel.weight);
        expect(weights.every((weight) => weight <= 30)).toBe(true);
    });
});
