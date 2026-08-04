const Card = ({ children, className = "", padding = "p-6" }) => {
  return (
    <div className={`rounded-2xl bg-white shadow-md ${padding} ${className}`}>
      {children}
    </div>
  );
};

export const StatCard = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-500 bg-orange-50",
    red: "text-red-600 bg-red-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <Card className="flex items-center gap-4">
      <div className={`rounded-xl p-3 ${tones[tone]}`}>
        <Icon size={28} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
};

export default Card;
