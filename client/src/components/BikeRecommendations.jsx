import { useState, useEffect, useMemo } from "react";
import { FaMotorcycle, FaHistory, FaMoneyBillWave } from "react-icons/fa";
import BikeCard from "./BikeCard";
import api from "../api/axios";
import { useVisitorBehavior } from "../hooks/useVisitorBehavior";
import { getSimilarBikes, getRecentViewRecommendations, getBudgetRecommendations } from "../utils/recommendations";

const Section = ({ title, icon: Icon, bikes }) => {
  if (bikes.length === 0) return null;

  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-primary" />
        <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.map((bike) => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    </div>
  );
};

const BikeRecommendations = ({ currentBike }) => {
  const [allBikes, setAllBikes] = useState([]);
  const { getRecentIds, getBehavior, getPreferredPriceRange } = useVisitorBehavior();

  useEffect(() => {
    api
      .get("/bikes")
      .then((res) => setAllBikes(res.data.bikes || []))
      .catch(() => {});
  }, []);

  const recentlyViewedIds = useMemo(() => getRecentIds(), [getRecentIds]);
  const behavior = useMemo(() => getBehavior(), [getBehavior]);
  const priceRange = useMemo(() => getPreferredPriceRange(), [getPreferredPriceRange]);

  const similar = useMemo(
    () => getSimilarBikes(currentBike, allBikes, recentlyViewedIds, 6),
    [currentBike, allBikes, recentlyViewedIds]
  );

  const recentViews = useMemo(
    () => getRecentViewRecommendations(currentBike, allBikes, behavior.recentViewed, behavior.viewedBrands, recentlyViewedIds, 6),
    [currentBike, allBikes, behavior, recentlyViewedIds]
  );

  const budget = useMemo(
    () => getBudgetRecommendations(currentBike, allBikes, priceRange, 6),
    [currentBike, allBikes, priceRange]
  );

  const hasAny = similar.length > 0 || recentViews.length > 0 || budget.length > 0;

  if (!hasAny) return null;

  return (
    <div className="mt-16 pt-10 border-t border-border dark:border-dark-border">
      <Section
        title="You May Also Like"
        icon={FaMotorcycle}
        bikes={similar}
      />
      <Section
        title="Based on Your Recent Views"
        icon={FaHistory}
        bikes={recentViews}
      />
      <Section
        title="More Bikes in Your Budget"
        icon={FaMoneyBillWave}
        bikes={budget}
      />
    </div>
  );
};

export default BikeRecommendations;
