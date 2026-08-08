const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700",
  DRIVER_ASSIGNED: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-indigo-50 text-indigo-700",
  ONGOING: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  ACTIVE: "bg-green-50 text-green-700",
  INACTIVE: "bg-slate-100 text-slate-500",
  VERIFIED: "bg-green-50 text-green-700",
  UNVERIFIED: "bg-amber-50 text-amber-700",
  PAYMENT_PENDING: "bg-orange-50 text-orange-700",
};

const Badge = ({ children, status }) => {
  const style = statusStyles[status] || "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {children}
    </span>
  );
};

export default Badge;
