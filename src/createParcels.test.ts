import { createParcels } from "./createParcels";
import { setTrackingIdToParcel } from "./index";
import { Parcel } from "./types";

describe("Create parcels", () => {
  let readyToShipParcels: Parcel[];

  beforeAll(async () => {
    // skip console.info logs
    console.info = () => {};

    const parcels = await createParcels();
    readyToShipParcels = await setTrackingIdToParcel(parcels);
  });

  it("tracking_id must be unique", () => {
    const totalUniqueIds = new Set(readyToShipParcels.map((p) => p.tracking_id))
      .size;
    expect(totalUniqueIds).toBe(readyToShipParcels.length);
  });

  it("should have max 15 parcels per palette", () => {
    const hash: { [paletteId: number]: number } = {};

    readyToShipParcels.forEach((parcel) => {
      const num = parcel.palette_number;
      if (hash[num]) {
        hash[num]++;
      } else {
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
