import type { Visits } from "../models/coupon";

const isValidVisit = (value: unknown): value is Visits => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const visit = value as Partial<Visits>;

  return (
    typeof visit.Business_Id === "number" &&
    Number.isFinite(visit.Business_Id) &&
    typeof visit.User_Id === "number" &&
    Number.isFinite(visit.User_Id)
  );
};

const toValidVisits = (visits: unknown): Visits[] => {
  if (!Array.isArray(visits)) {
    return [];
  }

  return visits.filter(isValidVisit);
};

export { isValidVisit, toValidVisits };
