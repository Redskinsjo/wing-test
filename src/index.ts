import axios from "axios";
import { createParcels } from "./createParcels";

import { Parcel } from "./types";

const generateTrackingId = async (): Promise<string> => {
  const id = await axios.get(
    "https://random.justyy.workers.dev/api/random/?cached&n=15"
  );
  return id.data;
};

export const setTrackingIdToParcel = (
  parcels: Array<Omit<Parcel, "tracking_id">>
): Promise<Array<Parcel>> => {
  const readyToShipParcels = Promise.all(
    parcels.map(async (parcel) => ({
      ...parcel,
      tracking_id: await generateTrackingId(),
    }))
  );
  return readyToShipParcels;
};

const calculateRevenue = (weight: number) => {
  if (weight <= 1) return 1;
  if (weight <= 5 && weight > 1) return 2;
  if (weight <= 10 && weight > 5) return 3;
  if (weight <= 20 && weight > 10) return 5;
  return 10;
};

createParcels()
  .then((parcels) => {
    setTrackingIdToParcel(parcels)
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
