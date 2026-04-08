import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStorefrontData } from "../features/admin/storeFront/storeFrontSlice";

const TopHeader = () => {
  const dispatch = useDispatch();

  const announcements = useSelector(
    (state) => state.storefront.contentData?.TopHeader || []
  );
  const loading = useSelector((state) => state.storefront.loading);

  useEffect(() => {
    dispatch(fetchStorefrontData("TopHeader"));
  }, [dispatch]);

  const activeDeals = announcements.filter((item) => item.isActive);

  if (loading || activeDeals.length === 0) return null;

  return (
    <div
      // UPDATED: Background uses --color-darkGray (#2D2424)
      // Border uses --color-secondary (#296374) for a subtle deep teal edge
      className="w-full overflow-hidden whitespace-nowrap border-b flex items-center bg-color-darkGray border-color-secondary)] h-8"
    >
      <div className="flex animate-marquee">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center">
            {activeDeals.map((deal, index) => (
              <span
                key={`${i}-${index}`}
                // UPDATED: Text uses --color-lightGray (#FDFDFB) for maximum readability
                className="mx-12 text-[10px] font-bold tracking-[0.2em] font-poppins uppercase text-color-lightGray)]"
              >
                {deal.announcement}
              </span>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite; /* Slightly slower (20s) for a more "Luxe" feel */
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TopHeader;
